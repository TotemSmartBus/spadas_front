import Pubsub from 'pubsub-js'
import React, {Component} from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios'
import './index.css'
import '../../globalconfig'
import 'leaflet.markercluster'
import {message} from 'antd'
import staticconfig from '../../../config.json'

import chinaProvider from 'leaflet.chinatmsproviders'
import {GetDistance, convertToZoomLevel} from '../../../tools'

/**
 *
 * @param 2-d array,lat&lon&time
 * select the offset-th vehicle path to be exhibited
 */
function getPaths(data, maxLen) {
    var map = new Map()
    for (var i = 0; i < data.length; i++) {
        if (map.has(data[i][2])) {
            map.get(data[i][2]).push(data[i])
        } else {
            map.set(data[i][2], [])
            map.get(data[i][2]).push(data[i])
        }

    }
    var result = []
    var len = map.size > maxLen ? maxLen : map.size
    var itr = map.values()
    while (len > 0) {
        result.push(itr.next().value)
        len--
    }
    return result
}

/**
 * 获取Argo数据集的AV车轨迹
 * @param data
 */
function getMainPath(data) {
    var result = []
    for (var i = 0; i < data.length; i++) {
        if (data[i][2] === 0) {
            result.push(data[i])
        }
    }
    return result
}

function getLeafNodes(node, nodes) {
    if (node.nodelist.length > 0) {
        getLeafNodes(node.nodelist[0], nodes)
        getLeafNodes(node.nodelist[1], nodes)
    } else {
        nodes.push(node)
    }
}

var heatmapConf = {
    "radius": 0.05,
    "maxOpacity": .8,
    "scaleRadius": true,
    "useLocalExtrema": true,
    latField: 'lat',
    lngField: 'lng',
    valueField: 'count',
}

export default class SpadasMap extends Component {
    constructor(props) {
        super(props)

        this.map = null
        //rectangle of range query
        this.rec = null
        //shades outside the rec of range query
        // this.shades = null
        // index page's all of the dataset's marker
        this.markers = []
        // clickedDataset's trajactory
        this.trajactoryList = []

        this.ClickedPointMarker = []

        this.querynodeLine = null

        // clickedDataset's circle shade
        this.circleShades = []

        this.querypointMarkers = []

        this.isRangeQueryButtonClicked = false

        this.markerGroup = null

        this.heatmapInstance = null

        this.nodes = []

        this.nodeMap = {}

        // 保存需要dsquery的点
        this.dsQueryNode = null

        // 保存join的点集
        this.joinNodes = []

        // 保存union的点集
        this.unionNodes = []

        this.opMode = -1

        this.state = {nodesVo: null, querynode: null, mode: null}

        // 聚类标签集合
        this.clusterGroup = null

        this.markersLayer = window.L.layerGroup();

        this.queryData = [];
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
                this.refreshMap();
            }).catch(e => {
            console.error(e)
        })
    }

    searchSingleDsReset() {
        if (this.trajactoryList.length != null) {
            this.trajactoryList.forEach(t => t.remove())
            this.trajactoryList.splice(0, this.trajactoryList.length)
        }
        if (this.circleShades.length > 0) {
            this.circleShades.forEach(s => s.remove())
        }
        if (this.ClickedPointMarker !== null && this.ClickedPointMarker.length > 0) {
            this.ClickedPointMarker.forEach(m => m.remove())
            this.ClickedPointMarker.splice(0, this.ClickedPointMarker.length)
        }
        if (this.querynodeLine !== null)
            this.querynodeLine.remove()

    }

    rmDssearchMatrix() {
        if (this.querypointMarkers.length != null) {
            this.querypointMarkers.forEach(t => t.remove())
        }
        this.querypointMarkers.splice(0, this.querypointMarkers.length)
    }

    rmMarkers() {
        this.markerGroup && this.markerGroup.remove()
    }

    rmHeatmap() {
        if (this.heatmapInstance !== null) {
            this.map.removeLayer(this.heatmapInstance)
            this.heatmapInstance = null
        }

    }

    removeShades() {
        this.rec && this.rec.remove()
    }

    rmClusterGroup() {
        this.clusterGroup && this.map.removeLayer(this.clusterGroup)
    }

    btnResetMap() {
        this.rec && this.rec.remove()
    }

//  TODO 不要在每次更新组件的时候请求一遍查询所有选中的数据集
    drawDatasets(datasets) {
        datasets.forEach(dataset => {
            axios.get(global.config.url + 'getds?id=' + dataset.datasetID)
                .then(res => {
                    var samplePoints = res.data.node.dataSamp
                    var rootPoints = res.data.node.matrix
                    var columns = res.data.node.columns
                    let color = dataset.color
                    this.rmHeatmap()
                    this.rmClusterGroup()

                    let points = rootPoints ? rootPoints : samplePoints
                    points.forEach((p, i) => {
                        var point = window.L.circleMarker(p, {
                            radius: 2,
                            color: 'black',
                            weight: 0.5,
                            opacity: 0.5,
                            fill: true,
                            fillColor: color,
                            fillOpacity: 1,
                        })
                        point.on('click', (e) => {
                            var msg = '[' + point.getLatLng()['lat'] + ',' + point.getLatLng()['lng'] + ']<br/>'
                            if (columns != null) {
                                Object.keys(columns).forEach(k => {
                                    msg += k + ' is ' + JSON.stringify(columns[k][i]) + '<br/>'
                                })
                            }
                            point.bindPopup(msg).openPopup()
                        })
                        this.ClickedPointMarker.push(point.addTo(this.map))
                    })
                })
        })
        let center = datasets[0].pivot
        let radius = GetDistance(datasets[0].mbrmax[1], datasets[0].mbrmax[0], datasets[0].mbrmin[1], datasets[0].mbrmin[0])
        let zoom = convertToZoomLevel(radius)
        this.map.flyTo(center, zoom)
    }

// 画每个文件的根节点（rootToDataset = -1），并画聚类标记，其中文件节点标记和聚类标记要不相同
// nodes：全部的文件节点
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

    refreshMap() {
        // shades, rec
        this.btnResetMap()
        // queryPointMarker
        this.rmDssearchMatrix()
        // markGroup
        this.rmMarkers()
        // circleShade, clickPointMarker
        this.searchSingleDsReset()
        this.rmHeatmap()
        this.rmClusterGroup()

        this.dsQueryNode = null
        this.isDsQuery = true
        this.joinNodes = []
        this.unionNodes = []
        this.queryData = []
        this.opMode = -1

        this.drawClusters(this.nodes)
        this.map.setView([40, -74], 4)
        this.isRangeQueryButtonClicked = false
        this.map.getContainer().classList.remove('crosshair-cursor')
    }


    componentWillUnmount() {
        PubSub.unsubscribe(this.token1)
        PubSub.unsubscribe(this.unionSingleToken)
        PubSub.unsubscribe(this.joinToken)
        PubSub.unsubscribe(this.emptyAugToken)
        PubSub.unsubscribe(this.addSingleToken)
        PubSub.unsubscribe(this.unionToken)
    }


    componentDidMount() {
        if (this.props.onRef !== undefined) {
            // 在子组件中调用父组件的方法，并把当前的实例传进去
            this.props.onRef(this)
        }


        this.token1 = PubSub.subscribe('dsquery2Map', (_, stateObj) => {
            this.setState(stateObj)
            if (stateObj.opMode === 0) {
                this.dsQueryNode = stateObj.dsQueryNode
                this.opMode = stateObj.opMode
            }
        })

        // 添加一个union数据集
        this.unionSingleToken = PubSub.subscribe('unionSingle', (_, obj) => {
            let isValidNode = true
            for (let i = 0; i < this.unionNodes.length; i++) {
                if (this.unionNodes[i] === obj.id) {
                    isValidNode = false
                    break
                }
            }
            if (isValidNode) {
                this.unionNodes.push(obj.id)
            }
        })

        // 多个数据集进行union
        this.unionToken = PubSub.subscribe('union', (_, obj) => {
            this.opMode = obj.opMode
            this.drawOp(this.opMode)
        })

        // 多个数据集进行join
        this.joinToken = PubSub.subscribe("join", (_, obj) => {
            this.opMode = obj.opMode
            this.drawOp(this.opMode)
        })

        this.emptyAugToken = PubSub.subscribe('emptyAug', (_, obj) => {
            this.opMode = obj.opMode
        })

        this.refreshToken = PubSub.subscribe('refresh', (_, obj) => {
            this.refreshMap();
        })

        this.map = window.L.map('map', {editable: true}).setView(staticconfig.map.defaultCenter, staticconfig.map.defaultZoom)
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
            // 点击开始绘图
            // that.notify("Draw Rectangle.");

            that.btnResetMap()
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
        }).addTo(this.map);

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

        this.loadData(1)
    }

    componentDidUpdate() {
        const {visibleDatasets} = this.props
        this.searchSingleDsReset()
        this.rmDssearchMatrix()
        this.rmMarkers()
        this.drawDatasets(visibleDatasets)
    }

    render() {
        return (
            <div id="map" style={this.props.style}></div>
        )
    }
}
