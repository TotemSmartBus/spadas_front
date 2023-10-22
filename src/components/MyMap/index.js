import React, {Component} from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios'
import './index.css'
import '../globalconfig'
import 'leaflet.markercluster'
import {message} from 'antd'

import chinaProvider from 'leaflet.chinatmsproviders'

/**
 *
 * @param {2-d array,lat&lon&time} data
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
 * @param {} data
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
    valueField: 'count'
}

export default class index extends Component {

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

        this.ciLayer = null

        this.markerGroup = null

        this.heatmapInstance = null

        this.nodes = []

        this.nodeMap = {}

        this.datasetIdMapping = {}

        // 保存需要dsquery的点
        this.dsQueryNode = null

        // 是否正在dsquery
        this.isDsQuery = true

        // 保存join的点集
        this.joinNodes = []

        // 保存union的点集
        this.unionNodes = []

        this.opMode = -1

        this.state = {nodesVo: null, querynode: null, mode: null}

        // 师姐的任务
        // this.colors = ['blue', 'red', 'orange', 'green', 'violet', 'silver']
        this.colors = ['red', 'orange', 'green', 'violet', 'blue']

        // 聚类标签集合
        this.clusterGroup = null

        this.markersLayer = window.L.layerGroup();

        this.drawRecBtnPopup = null;
        this.drawRecButton = null;
        this.isURQ = false;
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
        // if (this.markers !== null)
        //     this.markers.remove()
        if (this.markerGroup !== null) {
            this.markerGroup.remove()
        }
    }

    rmHeatmap() {
        if (this.heatmapInstance !== null) {
            this.map.removeLayer(this.heatmapInstance)
            this.heatmapInstance = null
        }

    }

    removeShades() {
        // if (this.shades !== null)
        //     this.map.removeLayer(this.shades)
        if (this.rec !== null)
            this.rec.remove()
    }

    rmClusterGroup() {
        if (this.clusterGroup !== null) {
            this.map.removeLayer(this.clusterGroup)
        }
    }

    btnResetMap() {
        // if (this.shades !== null)
        //     this.map.removeLayer(this.shades)
        if (this.rec !== null)
            this.rec.remove()
        // this.shades = new window.L.LeafletShades();
        // this.shades.addTo(this.map);
    }

    drawOp(opMode, clickId) {
        let clickIds = []

        if (opMode === 0 && this.dsQueryNode) {
            // dataset query情况，用a颜色画被query的dataset，用b颜色画点击的dataset
            // let clickId = this.dsQueryNode.datasetID
            // let clickIds = []
            let queriedID = [this.dsQueryNode.datasetID];
            clickIds.push(clickId)
            this.drawDetail(clickIds, 'blue', 0)
            if (queriedID >= 0) {
                this.drawDetail(queriedID, 'red', 0)
            } else {
                this.drawNew('red')
            }

        } else if (opMode === 1 && this.unionNodes.length > 0) {
            // union情况，所有union的dataset都画成红色
            this.unionNodes.forEach((n) => {
                clickIds.push(n)
            })
            this.drawDetail(clickIds, 'red', 1)
        } else if (opMode === 2 && this.joinNodes.length === 2) {
            // join情况，数据集q蓝色，数据集d红色，同时展示
            let clickIds1 = []
            let clickIds2 = []
            clickIds1.push(this.joinNodes[0])
            clickIds2.push(this.joinNodes[1])
            this.drawDetail(clickIds1, 'blue', 2)
            this.drawDetail(clickIds2, 'red', 2)
        } else {
            // 常规的点击操作，点击的数据集蓝色显示
            // let clickIds = []
            clickIds.push(clickId)
            this.drawDetail(clickIds, 'blue', -1)
        }
    }

    drawNew(color) {
        if (this.queryData !== []) {
            this.queryData.forEach(p => {
                this.ClickedPointMarker.push(window.L.circleMarker(p, {
                    radius: 2,
                    color: 'black',
                    weight: 0.5,
                    opacity: 0.5,
                    fill: true,
                    fillColor: color,
                    fillOpacity: 1
                }).addTo(this.map))
            })
        }
    }

    drawDetail(clickIds, color, opMode) {
        clickIds.forEach((item, index) => {
            axios.get(global.config.url + 'getds?id=' + item)
                .then(res => {
                    var samplePoints = res.data.node.dataSamp
                    var rootPoints = res.data.node.matrix
                    var columns = res.data.node.columns
                    // var points = res.data.node.matrix

                    // 师姐的任务，color -> myColor
                    // resData.forEach(p => {
                    //     this.ClickedPointMarker.push(window.L.circleMarker(p.slice(0, 2), { radius: 1.5, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: 'blue', fillOpacity: 1 }).addTo(this.map))
                    // })

                    // var heatmapLayer = HeatmapOverlay(heatmapConf)
                    // 载入史册的一次window.

                    // if (opMode < 0) {
                    //     this.rmHeatmap()
                    // }
                    this.rmHeatmap()
                    this.rmClusterGroup()

                    if (rootPoints === null) { // 点数目太大，显示不了，故使用热力图展示
                        // 不用热力图了，直接显示采样点看看情况
                        // this.heatmapInstance = new window.HeatmapOverlay(heatmapConf)
                        // this.heatmapInstance.setData(standardData)
                        // // this.heatmapInstance.addTo(this.map)
                        // this.map.addLayer(this.heatmapInstance)

                        // 直接显示采样点
                        samplePoints.forEach(p => {
                            var point = window.L.circleMarker([p[1], p[0]], {
                                radius: 2,
                                color: 'black',
                                weight: 0.5,
                                opacity: 0.5,
                                fill: true,
                                fillColor: color,
                                fillOpacity: 1
                            })
                            point.on('click', (e) => {
                                point.bindPopup('[' + p[1] + ',' + p[0] + ']').openPopup()
                            })
                            this.ClickedPointMarker.push(point.addTo(this.map))
                        })
                    } else {
                        rootPoints.forEach((p, i) => {
                            var point = window.L.circleMarker(p, {
                                radius: 2,
                                color: 'black',
                                weight: 0.5,
                                opacity: 0.5,
                                fill: true,
                                fillColor: color,
                                fillOpacity: 1
                            })
                            point.on('click', (e) => {
                                var msg = '[' + point.getLatLng()['lat'] + ',' + point.getLatLng()['lng'] + ']<br/>'
                                if (columns != null) {
                                    debugger
                                    Object.keys(columns).forEach(k => {
                                        msg += k + ' is ' + JSON.stringify(columns[k][i]) + '<br/>'
                                    })
                                }
                                point.bindPopup(msg).openPopup()
                            })
                            this.ClickedPointMarker.push(point.addTo(this.map))
                        })
                    }

                    // this.map.eachLayer(function (layer) {
                    //     console.log(layer)
                    // })

                    // that.ClickedPointMarker.addTo(that.map)
                    // this.circleShade = window.L.circle(rootPivot, { radius: rootRadius * 100000, opacity: 0.8, fillOpacity: 0, weight: 1, color: strokeColor }).addTo(this.map)

                    // 师姐的任务，color -> myColor
                    // this.circleShades.push(window.L.circle(rootPivot, { radius: rootRadius * 100000, opacity: 0.8, fillOpacity: 0, weight: 1, color: color }).addTo(this.map))
                    // this.circleShades.push(window.L.circle(rootPivot, { radius: rootRadius * 100000, opacity: 0.8, fillOpacity: 0, weight: 1, color: color }).addTo(this.map))
                    // this.map.flyTo(rootPivot, 9, { duration: 4 })
                })
        })
    }

    drawMarkers(nodes) {

        var markerArr = []
        window.$.each(nodes, function (index, valNode) {
            // let marker = window.L.marker(new window.L.LatLng(val.pivot[0], val.pivot[1]), { id: val.datasetID }).bindPopup(res.data.filenames[val.datasetID]).openPopup()
            let val = valNode.node
            let marker = window.L.circleMarker([val.pivot[0], val.pivot[1]], {
                radius: 3,
                id: val.datasetID,
                color: 'black',
                weight: 0.5,
                opacity: 0.5,
                fillColor: 'green',
                fillOpacity: 1
            })
            // var marker = window.L.marker(new window.L.LatLng(val.pivot[0], val.pivot[1]), { id: val.datasetID, icon: myIcon, title: 'hello' }).bindPopup("goodbye").openPopup()
            marker.on("click", function (e) {
                axios.get(global.config.url + 'getds?id=' + e.target.options.id)
                    .then(res2 => {
                        PubSub.publish('mapClickNode', res2.data.node)
                    })
            })
            markerArr.push(marker)
            // marker.addTo(that.map)
        })
        this.markerGroup = window.L.layerGroup(markerArr)
        this.map.addLayer(this.markerGroup)
    }

    // 画城市节点，对于不存在城市概念的数据集集需要进行改变
    // 目前的思路是使用回聚类标记
    drawCityNodes(nodes) {
        var markerArr = []
        for (let node of nodes) {
            let marker = window.L.marker(node.pivot)
            marker.on("mouseover", () => {
                marker.bindPopup(node.cityName).openPopup()
            })
            marker.on("click", () => {
                // PubSub.publish('mapClickNode', nodes[i].nodeList)
                // PubSub.publish('searchhits', nodes[i].nodeList)
                // 都有node了直接获取citynode下面的node就好了啊还在这rangequery干嘛

                // rangequery传入
                axios.post(global.config.url + 'rangequery', {
                    k: node.nodeCount,
                    dim: 2,
                    querymax: node.maxBox,
                    querymin: node.minBox,
                    cityName: node.cityName,
                }).then(res => {
                    PubSub.publish('searchhits', {
                        data: res.data.nodes,
                        isTopk: false
                    });
                    this.rmMarkers()
                    this.map.flyTo(node.pivot, 9)
                    // this.drawMarkers(res.data.subCityNodes)
                    // 虽然是nodes属性，但其中不包含index node，只包含文件名和id
                    this.drawMarkers(res.data.nodes)
                })
            })
            markerArr.push(marker)
        }
        this.markerGroup = window.L.layerGroup(markerArr)
        this.map.addLayer(this.markerGroup)
    }

    // 画每个文件的根节点（rootToDataset = -1），并画聚类标记，其中文件节点标记和聚类标记要不相同
    // nodes：全部的文件节点
    drawClusters(nodes) {

        // 初始化clusterGroup
        this.clusterGroup = window.L.markerClusterGroup({
            maxClusterRadius: 30,
            disableClusteringAtZoom: 14
        })
        // 先添加全部文件节点到地图上
        for (let node of nodes) {
            try {
                var fileMarker = window.L.marker(node.pivot, {
                    name: node.fileName,
                    id: node.datasetID
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

        // this.clusterGroup.eachLayer((marker) => {
        //     console.log(marker.options.id)
        //     // marker.bindPopup(marker.options.id)
        // })

        // 点击聚类标记，会一层层拆开聚类
        // 增加一些信息的显示
        // this.clusterGroup.on("clusterclick", (a) => {
        //     let childCount = a.layer.getChildCount()
        //     console.log("cluster " + a.layer.getAllChildMarkers() + " includes " + childCount + " markers")
        // })

        // 点击聚类标记会触发左侧结果栏显示聚类下的全部文件节点
    }

    // 用于和论文中的例子匹配而增加的默认样例flu-shot
    // 要求初始界面地图上聚焦该数据集，左侧结果栏显示该数据集，左侧详情栏显示该数据集详情
    loadExample() {
        var exampleLeafletId = 0;
        var layers = this.markersLayer.getLayers();
        // 找到markersLayer中该数据集对应的图层，记录其_leaflet_id属性（只有通过该属性才能获取到该图层对象）
        layers.forEach((layer) => {
            if (layer.options.name === "phl--flu-shot.csv") {
                exampleLeafletId = layer._leaflet_id;
            }
        })
        if (exampleLeafletId === 0) {
            console.log('there\'s no example dataset')
            return
        }
        var exampleMarker = this.markersLayer.getLayer(exampleLeafletId);
        exampleMarker.fire('click');
        this.map.setView([40, -75], 4);
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
        // this.setState({ isURQ: false });
        this.loadExample();
        this.isRangeQueryButtonClicked = false;
        this.map.getContainer().classList.remove('crosshair-cursor');
    }


    componentWillUnmount() {
        PubSub.unsubscribe(this.token1)
        PubSub.unsubscribe(this.unionSingleToken)
        PubSub.unsubscribe(this.joinToken)
        PubSub.unsubscribe(this.emptyAugToken)
        PubSub.unsubscribe(this.addSingleToken)
        PubSub.unsubscribe(this.joinSingleToken)
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

        //设置地图和瓦片图层
        // 40,-80
        // 34, 108
        // [25, -80], 4
        // this.map = window.L.map('map', { editable: true }).setView([27, 111], 4)
        this.map = window.L.map('map', {editable: true}).setView([38, -77], 4)
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
            minZoom: 1
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
                rangeMin: mbrmin
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
                mode: global.config.rangeMode
            }).then(res => {
                // that.removeShades()
                let pure_nodes = res.data.nodes.map(item => item.node)
                PubSub.publish('searchhits', {
                    data: pure_nodes,
                    isTopk: false
                });
            });
        }
        this.loadData(1)
    }

    componentDidUpdate() {
        const {clickId} = this.props
        // this.setState({mode:0})
        this.searchSingleDsReset()
        this.rmDssearchMatrix()
        this.rmMarkers()
        this.drawOp(this.opMode, clickId)
    }

    render() {
        return (
                <div id="map" style={this.props.style}></div>
        )
    }
}
