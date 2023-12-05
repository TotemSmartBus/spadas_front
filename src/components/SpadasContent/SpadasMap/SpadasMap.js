import React, {Component} from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios'
import './index.css'
import '../../global'
import 'leaflet.markercluster'
import {message} from 'antd'
import 'leaflet-easybutton'
import 'leaflet-rotate'
// import chinaProvider from 'leaflet.chinatmsproviders'
import {GetDistance, convertToZoomLevel} from '../../../tools'

const new_york_center = [40.713922, -73.956008]
const pittsburgh_center = [40.46, -79.97]
const zoom = 14
let lastPoints = null;
let lastRoad = null;
export default class SpadasMap extends Component {
    constructor(props) {
        super(props)

        this.map = null
        // index page's all of the dataset's marker
        // clickedDataset's trajactory
        this.trajectoryDatabase = {}

        this.isRangeQueryButtonClicked = false

        this.nodes = []

        this.nodeMap = {}

        // 保存需要dsquery的点
        this.dsQueryNode = null

        // 保存union的点集
        this.unionNodes = []

        // 聚类标签集合
        this.clusterGroup = null

        this.markersLayer = window.L.layerGroup()
    }

    clusterClick = (a) => {
        var markers = a.layer.getAllChildMarkers()
        let clickNodes = []
        for (var i = 0; i < markers.length; i++) {
            clickNodes.push(this.nodeMap[markers[i].options.id])
        }
        PubSub.publish("searchhits", {data: clickNodes})
    }

    loadData = (id) => {
        axios.get(global.config.url + 'load?id=' + id)
            .then(res => {
                for (let x of res.data) {
                    this.nodes.push(x)
                }
                this.refreshMap()
            }).catch(e => {
            console.error(e)
        })
    }

    loadTrajectory = (id) => {
        console.log('loadTrajectory')
        axios.get(global.config.url + 'trajectory?id=' + id)
            .then(res => {
                this.trajectoryDatabase[id] = res.data
                this.refreshMap()
            })
    }

    drawTrajectory(id) {
        if (this.trajectoryDatabase[id] == null) {
            console.error("no trajectory for " + id)
        }
        let trajectories = this.trajectoryDatabase[id]
        for (let i = 0; i < trajectories.length; i++) {
            let trajectory = trajectories[i]
            this.drawLine(i, trajectory, 'gray')
        }
    }

    drawLine(tid, trajectory, color) {
        let points = []
        let msg = '[T' + tid + ']'
        for (let i = 0; i < trajectory.length; i++) {
            let p = new window.L.LatLng(trajectory[i][0], trajectory[i][1])
            msg += '(' + trajectory[i][0] + ',' + trajectory[i][1] + '),'
            points.push(p)
        }
        let trajectoryLine = new window.L.polyline(points, {
            color: color,
            weight: 3,
            smoothFactor: 1,
        })
        trajectoryLine.bindPopup(msg)
        trajectoryLine.on('click', () => {
            trajectoryLine.openPopup()
        })
        this.map.addLayer(trajectoryLine)
    }

    rmClusterGroup() {
        this.clusterGroup && this.map.removeLayer(this.clusterGroup)
    }

//  TODO 不要在每次更新组件的时候请求一遍查询所有选中的数据集
    drawDatasets(datasets) {
        datasets.forEach((dataset, idx) => {
            axios.get(global.config.url + 'getds?id=' + dataset.datasetID)
                .then(res => {
                    var samplePoints = res.data.node.dataSamp
                    var rootPoints = res.data.node.matrix
                    var columns = res.data.node.columns
                    let color = dataset.color
                    this.rmClusterGroup()

                    let points = rootPoints ? rootPoints : samplePoints
                    points.forEach((p, i) => {
                        var point = window.L.circleMarker(p, {
                            radius: 4,
                            color: 'black',
                            weight: 0.5,
                            fill: true,
                            fillColor: color,
                            fillOpacity: 1,
                        })
                        point.on('click', (e) => {
                            var msg = 'D' + dataset.datasetID + '-P' + i + '-[' + point.getLatLng()['lat'] + ',' + point.getLatLng()['lng'] + ']<br/>'
                            if (columns != null) {
                                Object.keys(columns).forEach(k => {
                                    msg += k + ' is ' + JSON.stringify(columns[k][i]) + '<br/>'
                                })
                            }
                            point.bindPopup(msg).openPopup()
                        })
                        point.addTo(this.map)
                    })
                })
        })
        let center = datasets[0].pivot
        let radius = GetDistance(datasets[0].mbrmax[1], datasets[0].mbrmax[0], datasets[0].mbrmin[1], datasets[0].mbrmin[0])
        let zoom = convertToZoomLevel(radius)
        this.map.flyTo(center, zoom)
    }

    // 数据集维度地图展示，每个数据集标识为一个数据点，相近的会自动聚集
    drawClusters(nodes) {
        // 初始化clusterGroup
        this.clusterGroup = window.L.markerClusterGroup({
            maxClusterRadius: 30,
            disableClusteringAtZoom: 14,
        })
        // 先添加全部文件节点到地图上
        for (let node of nodes) {
            try {
                var fileMarker = window.L.marker(node.pivot, {
                    name: node.fileName,
                    id: node.datasetID,
                }).addTo(this.markersLayer);
            } catch (error) {
                console.error(error)
                console.error("reading" + node.fileName + "failed")
            }
            fileMarker.on("click", function (e) {
                let clickNodes = []
                clickNodes.push(node);
                PubSub.publish("searchhits", {data: clickNodes})
            })
            fileMarker.bindPopup(`${node.fileName}`)
            this.clusterGroup.addLayers(fileMarker)
            this.nodeMap[node.datasetID] = node
        }

        this.clusterGroup.on('mouseover', function (event) {
            var marker = event.layer
            var markerName = marker.options.name
            marker.bindPopup(`${markerName}`).openPopup()
        }).addTo(this.map)

        this.clusterGroup.on("clusterclick", this.clusterClick)
    }

    // re-paint the map
    refreshMap() {
        this.rmClusterGroup()

        this.dsQueryNode = null
        this.unionNodes = []

        this.drawClusters(this.nodes)
        this.resetView()
        this.isRangeQueryButtonClicked = false
        this.map.getContainer().classList.remove('crosshair-cursor')
        this.drawTrajectory(0)
    }

    resetView() {
        this.map.setView(pittsburgh_center, zoom)
    }

    resetHighlight() {
        lastPoints = null
        lastRoad = null
    }

    drawHighlight() {
        if (lastPoints != null) {
            lastPoints.removeFrom(this.map)
        }
        if (lastRoad != null) {
            lastRoad.removeFrom(this.map)
        }
        // TODO  一次只画一个，其他的要remove掉
        if (this.props.highlight !== undefined && this.props.highlight.points.length > 0) {
            let points = []
            for (let i in this.props.highlight.points) {
                let p = this.props.highlight.points[i]
                let point = window.L.circleMarker(p, {
                    radius: 6,
                    color: 'red',
                    weight: 0.5,
                    opacity: 0.5,
                    fill: true,
                    fillColor: 'red',
                    fillOpacity: 1,
                })
                let msg = '[' + p[0] + ',' + p[1] + ']'
                point.bindPopup(msg)
                point.openPopup()
                points.push(point)
            }
            // draw the link between points
            if (this.props.highlight.points.length > 1) {
                let pointLink = new window.L.polyline(this.props.highlight.points, {
                    color: 'green',
                    weight: 4,
                    smoothFactor: 1,
                    strokeDasharray: [10, 10],
                })
                points.push(pointLink)
            }
            let layerGroup = window.L.layerGroup(points)
            lastPoints = layerGroup
            layerGroup.addTo(this.map)
            if (this.props.highlight.roads.length > 0) {
                let road = this.props.highlight.roads[0]
                let points = []
                let msg = '[T' + road.id + ']'
                for (let i = 0; i < road.points.length; i++) {
                    let p = new window.L.LatLng(road.points[i][0], road.points[i][1])
                    msg += '(' + road.points[i][0] + ',' + road.points[i][1] + '),'
                    points.push(p)
                }
                let trajectoryLine = new window.L.polyline(points, {
                    color: 'red',
                    weight: 6,
                    smoothFactor: 1,
                })
                trajectoryLine.bindPopup(msg)
                trajectoryLine.openPopup()
                // trajectoryLine.on('click', () => {
                //     trajectoryLine.openPopup()
                // })
                let layerGroup = window.L.layerGroup()
                layerGroup.addLayer(trajectoryLine)
                layerGroup.addTo(this.map)
                lastRoad = layerGroup
            }
            this.map.flyTo(this.props.highlight.points[0], 16)
        }
    }

    clearHighlight() {
        if (lastPoints != null) {
            lastPoints.removeFrom(this.map)
        }
        if (lastRoad != null) {
            lastRoad.removeFrom(this.map)
        }
        lastPoints = null
        lastRoad = null
    }


    componentWillUnmount() {
        PubSub.unsubscribe(this.addSingleToken)
    }


    componentDidMount() {
        if (this.props.onRef !== undefined) {
            // 在子组件中调用父组件的方法，并把当前的实例传进去
            this.props.onRef(this)
        }

        this.map = window.L.map('map', {
            editable: true,
            // rotate: true,
            // rotateControl: {
            //     closeOnZeroBearing: false,
            // },
            // bearing: 42,
            maxZoom: 18,
            minZoom: 1,
        }).setView(global.config.map.defaultCenter, global.config.map.defaultZoom)
        // var OpenStreetMap = window.L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
        //     minZoom: 1,
        //     maxZoom: 19,
        //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // }).addTo(this.map)
        // 中字，深度够
        // this.map.addLayer(window.L.tileLayer('http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}', {
        //     // subdomains: ['1', '2', '3', '4'],
        //     minZoom: 1,
        //     maxZoom: 19
        //   }));

        // 高德源，优势：放大倍数足够，不需要vpn；劣势：国外地图标注极少
        // this.map.addLayer(window.L.tileLayer.chinaProvider('GaoDe.Normal.Map', {maxZoom: 19, minZoom: 1}))

        // 高德源，优势：不需要vpn；劣势：国外地图标注较少，放大倍数不够
        // this.map.addLayer(window.L.tileLayer('http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}', {maxZoom: 14, minZoom: 1}))

        // 使用默认osm地图源，需要翻墙加载
        this.map.addLayer(window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 1,
        }))

        var that = this
        var mbrmax = []
        var mbrmin = []


        // 添加按钮控件
        // 画框按钮
        // 本来使用的是html实体编码，现在直接使用的是“□”符号
        this.drawRecButton = window.L.easyButton('<span class="star1">□</span>', function () {
            const mapContainer = that.map.getContainer();
            mapContainer.classList.remove('crosshair-cursor');
            // that.map.getContainer().style.cursor = '';
            if (!that.isRangeQueryButtonClicked) {
                // that.map.getContainer().style.cursor = 'crosshair';
                // that.notify("Please draw a rectangle.", "origin");
                message.info("Please draw a rectangle.");
                mapContainer.classList.add('crosshair-cursor');
                that.rec = that.map.editTools.startRectangle()
                // that.rec = that.map.
            } else {
                message.success("Drawing Cancelled.");
            }
            that.isRangeQueryButtonClicked = !that.isRangeQueryButtonClicked
        }).addTo(this.map)

        this.map.on('editable:drawing:end', function (e) {
            var mbrmax = [that.rec._bounds._northEast.lat, that.rec._bounds._northEast.lng];
            var mbrmin = [that.rec._bounds._southWest.lat, that.rec._bounds._southWest.lng];
            PubSub.publish('getRange', {
                rangeMax: mbrmax,
                rangeMin: mbrmin,
            })
            const mapContainer = that.map.getContainer();
            mapContainer.classList.remove('crosshair-cursor');
        })

        // 搜索按钮
        // 负责urq和rq在画框以后的搜索步骤
        window.L.easyButton('<span class="star2">&telrec;</span>', handleSearch).addTo(this.map);

        function handleSearch() {
            if (that.rec === null) {
                mbrmax = [90, 180]
                mbrmin = [-90, -180]
            } else {
                mbrmax = [that.rec._bounds._northEast.lat, that.rec._bounds._northEast.lng]
                mbrmin = [that.rec._bounds._southWest.lat, that.rec._bounds._southWest.lng]
            }
            axios.post(global.config.url + 'rangequery', {
                k: global.config.k,
                dim: 2,
                querymax: mbrmax,
                querymin: mbrmin,
                mode: global.config.rangeMode,
            }).then(res => {
                // that.removeShades()
                let pure_nodes = res.data.nodes.map(item => item.node)
                PubSub.publish('searchhits', {
                    data: pure_nodes,
                    isTopk: false,
                });
            });
        }

        // this.drawShowRoadmapButton = window.L.easyButton('<span class="star1"><EyeOutlined /></span>', handleShowRoadmap).addTo(this.map);

        function handleShowRoadmap() {
            const mapContainer = that.map.getContainer();
            mapContainer.classList.remove('crosshair-cursor');
            // that.map.getContainer().style.cursor = '';
            if (!that.isRangeQueryButtonClicked) {
                // that.map.getContainer().style.cursor = 'crosshair';
                // that.notify("Please draw a rectangle.", "origin");
                message.info("Please draw a rectangle.");
                mapContainer.classList.add('crosshair-cursor');
                that.rec = that.map.editTools.startRectangle()
                // that.rec = that.map.
            } else {
                message.success("Drawing Cancelled.");
            }
            that.isRangeQueryButtonClicked = !that.isRangeQueryButtonClicked
        }

        this.loadData(1)
        // to test load trajectories
        // this.loadTrajectory(0)
    }

    componentDidUpdate() {
        this.drawDatasets(this.props.datasets)
        this.drawHighlight()
    }

    render() {
        return (
            <div id="map" style={this.props.style}></div>
        )
    }
}
