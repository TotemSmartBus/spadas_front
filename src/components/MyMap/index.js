import React, { Component } from 'react'
import PubSub, { publish } from 'pubsub-js'
import pic from './square.svg'
import tri from './triangle.png'
import axios from 'axios'
// import { HeatmapOverlayConfiguration } from 'heatmap.js'
// 无比关键的一次import
// import 'heatmap.js'
// import { HeatmapOverlay } from 'heatmap.js/plugins/leaflet-heatmap'
// import 'leaflet-easybutton'
// import 'leaflet'
import './index.css'
import '../globalconfig'
import chinaProvider from 'leaflet.chinatmsproviders'
import 'leaflet.markercluster'
// import { Toast } from 'react-bootstrap'
import { toast, ToastContainer, Toaster } from 'react-hot-toast'

// import AutoGraticule from 'leaflet-auto-graticule';
// import LeafletShades from 'leaflet-shades/src/js/leaflet-shades'

// import './leaflet.canvas-markers.js'
// import P from"leaflet-canvas-marker"
import { CanvasMarkerLayer } from "@panzhiyue/leaflet-canvasmarker"
import { globalConfig } from 'antd/lib/config-provider'
import RefAutoComplete from 'antd/lib/auto-complete'
// import L from "leaflet";
// import "leaflet-shades"

// import '../../../node_modules/leaflet-canvas-marker'

// HeatmapOverlay = require('heatmap.js')

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
        }
        else {
            map.set(data[i][2], [])
            map.get(data[i][2]).push(data[i])
        }

    }
    var result = []
    var len = map.size > maxLen ? maxLen : map.size
    var itr = map.values()
    while (len > 0) {
        result.push(itr.next().value)
        // console.log(result[len - 1])
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
    // console.log(node)
    if (node.nodelist.length > 0) {
        getLeafNodes(node.nodelist[0], nodes)
        getLeafNodes(node.nodelist[1], nodes)
    } else {
        nodes.push(node)
    }
}

// const myIcon = new window.L.Icon({
//     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
//     // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//     iconSize: [10, 16]
// })
const myIcon = new window.L.Icon({
    iconUrl: tri,
    // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [10, 16]
})

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

        this.state = { nodesVo: null, querynode: null, mode: null }

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
        console.log("call rmMarkers()")
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
        console.log("opMode = " + opMode)
        console.log(clickId)
        let clickIds = []

        if (opMode === 0 && this.dsQueryNode) {
            // dataset query情况，用a颜色画被query的dataset，用b颜色画点击的dataset
            // let clickId = this.dsQueryNode.datasetID
            // let clickIds = []
            let queriedID = [this.dsQueryNode.datasetID];
            clickIds.push(clickId)
            // console.log("xxx: " + clickIds)
            this.drawDetail(clickIds, 'blue', 0)
            if (queriedID >= 0) {
                this.drawDetail(queriedID, 'red', 0)
            } else {
                this.drawNew('red')
            }

        } else if (opMode === 1 && this.unionNodes.length > 0) {
            // union情况，所有union的dataset都画成红色
            // let clickIds = []
            this.unionNodes.forEach((n) => {
                // let clickId = n.datasetID
                console.log(n)
                clickIds.push(n)
            })
            this.drawDetail(clickIds, 'red', 1)
        } else if (opMode === 2 && this.joinNodes.length == 2) {
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
            console.log(clickIds)
            this.drawDetail(clickIds, 'blue', -1)
        }
        // if (clickId !== null) {
        // let clickIds = []
        // clickIds.push(clickId)
        // this.drawDetail(clickIds, 'blue', -1)
        // }
    }

    drawNew(color) {
        console.log(this.queryData);
        if (this.queryData !== []) {
            this.queryData.forEach(p => {
                this.ClickedPointMarker.push(window.L.circleMarker(p, { radius: 2, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: color, fillOpacity: 1 }).addTo(this.map))
            })
        }
    }

    drawDetail(clickIds, color, opMode) {
        console.log("draw detail of one dataset")
        // 师姐的任务
        console.log(clickIds)
        var len = clickIds.length
        console.log('len = ' + len)
        // var i = 
        var myColor = this.colors[clickIds % len]
        console.log('my color = ' + myColor)

        clickIds.forEach((item, index) => {
            console.log("clickId = " + item)

            var myColor = this.colors[index % len]
            console.log('my color = ' + myColor)

            axios.get(global.config.url + 'getds' + '?id=' + item)
                .then(res => {
                    console.log(res.data);
                    var resData = res.data.node.dataSamp
                    var root = res.data.node.node
                    var rootPivot = root.pivot
                    var rootRadius = root.radius
                    var rootPointCount = root.totalCoveredPoints
                    var rootPoints = res.data.node.matrix
                    // var rootType = root.type
                    // var nodes = []
                    // getLeafNodes(root, nodes)
                    // console.log(nodes)

                    var sampData = new Array()
                    resData.forEach((v, i) => {
                        let item = new Array()
                        item['lat'] = v[0]
                        item['lng'] = v[1]
                        item['count'] = v[2]
                        sampData[i] = item
                    })
                    var standardData = {
                        max: 8,
                        data: sampData
                    }
                    console.log(standardData)
                    console.log(sampData);

                    // var points = res.data.node.matrix

                    // 师姐的任务，color -> myColor
                    // resData.forEach(p => {
                    //     this.ClickedPointMarker.push(window.L.circleMarker(p.slice(0, 2), { radius: 1.5, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: 'blue', fillOpacity: 1 }).addTo(this.map))
                    // })

                    // var heatmapLayer = HeatmapOverlay(heatmapConf)
                    // 载入史册的一次window.

                    console.log(rootPoints)

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
                        sampData.forEach(p => {
                            this.ClickedPointMarker.push(window.L.circleMarker([p['lat'], p['lng']], { radius: 2, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: color, fillOpacity: 1 }).addTo(this.map))
                        })
                    } else {
                        rootPoints.forEach(p => {
                            this.ClickedPointMarker.push(window.L.circleMarker(p, { radius: 2, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: color, fillOpacity: 1 }).addTo(this.map))
                        })
                        // rootPoints.forEach(p => {
                        // this.ClickedPointMarker.push(window.L.marker(p, {icon: myIcon}).addTo(this.map))
                        // })
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
        console.log(nodes)

        var markerArr = []
        window.$.each(nodes, function (index, valNode) {
            // console.log(val)
            // 先纬度后经度
            //i+=1
            // console.log(val)
            // console.log(index)
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
            // console.log(this.datasetIdMapping)
            // var marker = window.L.marker(new window.L.LatLng(val.pivot[0], val.pivot[1]), { id: val.datasetID, icon: myIcon, title: 'hello' }).bindPopup("goodbye").openPopup()
            marker.on("click", function (e) {
                console.log("call getds url")
                console.log(e.target.options.id)
                // 改的就是你
                axios.get(global.config.url + 'getds' + '?id=' + e.target.options.id)
                    .then(res2 => {
                        // console.log("xxxxxxx!")
                        // console.log(res2.data.node);
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
        console.log(nodes)
        console.log(Object.prototype.toString.call(nodes[0]))
        var markerArr = []
        var len = nodes.length
        console.log(len)

        for (let node of nodes) {
            let marker = window.L.marker(node.pivot)
            marker.on("mouseover", () => {
                marker.bindPopup(node.cityName).openPopup()
            })
            marker.on("click", () => {
                // console.log(nodes[i])
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
                    console.log(res)
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
        console.log(this.map)
    }

    // 画每个文件的根节点（rootToDataset = -1），并画聚类标记，其中文件节点标记和聚类标记要不相同
    // nodes：全部的文件节点
    drawClusters(nodes) {
        // 确认一下参数信息
        console.log("length of nodes is: " + this.nodes.length)
        console.log("first node is: " + nodes[100])

        // 初始化clusterGroup
        this.clusterGroup = window.L.markerClusterGroup({
            maxClusterRadius: 30,
            disableClusteringAtZoom: 14
        })

        // 先添加全部文件节点到地图上
        for (let node of nodes) {
            // console.log(node.datasetID)
            // if (node.pivot[0] == null) {
            //     console.log("!!!" + node.pivot);
            // }
            // console.log(node.datasetID + " : " + node.pivot);
            var fileMarker = window.L.marker(node.pivot, { name: node.fileName, id: node.datasetID }).addTo(this.markersLayer);
            fileMarker.on("click", function (e) {
                var markerID = e.target.options.id
                let clickNodes = []
                clickNodes.push(nodes[parseInt(markerID)])
                PubSub.publish("searchhits", { data: clickNodes })
            })
            fileMarker.bindPopup(`${node.fileName}`)
            this.clusterGroup.addLayers(fileMarker)
            // let fileMarker = window.L.circleMarker([node.pivot[0], node.pivot[1]], {
            //     radius: 3,
            //     id: node.datasetID,
            //     color: 'black',
            //     weight: 0.5,
            //     opacity: 0.5,
            //     fillColor: 'green',
            //     fillOpacity: 1
            // })
            // let fileMarker = window.L.marker(node.pivot, {id: node.datasetID}).addTo(this.map).bindPopup("1")
            // let fileMarker = window.L.marker(node.pivot, { id: node.datasetID })
            // let fileMarker = window.L.marker(node.pivot)
            // fileMarker.setOptions({ id: node.datasetID})
            // fileMarker.on("mouseover", () => {
            //     console.log(fileMarker.options.id)
            //     let idd = fileMarker.options.id
            //     fileMarker.bindPopup(idd).openPopup()
            // })
            // fileMarker.on('mouseover', function(e) {
            //     console.log(fileMarker.options.id)
            //     this.openPopup()
            // })
            // fileMarker.addTo(this.clusterGroup)
        }

        this.clusterGroup.on('mouseover', function (event) {
            var marker = event.layer
            var markerName = marker.options.name
            marker.bindPopup(`${markerName}`).openPopup()
        }).addTo(this.map)

        this.clusterGroup.on("clusterclick", (a) => {
            console.log(a);
            var markers = a.layer.getAllChildMarkers()
            console.log(markers);
            let clickNodes = []
            for (var i = 0; i < markers.length; i++) {
                console.log(this.nodes[markers[i].options.id])
                clickNodes.push(this.nodes[markers[i].options.id])
            }
            console.log(clickNodes)
            PubSub.publish("searchhits", { data: clickNodes })
        })

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
            if (layer.options.name == "phl--flu-shot.csv") {
                exampleLeafletId = layer._leaflet_id;
                console.log(exampleLeafletId);
            }
        })
        console.log(this.markersLayer.getLayer(exampleLeafletId));
        // 触发该数据集图层对象的点击事件
        var exampleMarker = this.markersLayer.getLayer(exampleLeafletId);
        exampleMarker.fire('click');
        this.map.setView([40, -75], 4);
    }

    refreshMap() {
        console.log("call refreshMap()")
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

        // this.drawMarkers()
        // this.drawCityNodes(this.nodes)
        this.drawClusters(this.nodes)
        this.map.setView([38, -77], 4)
        // this.setState({ isURQ: false });
        this.loadExample();
        this.isRangeQueryButtonClicked = false;
        this.map.getContainer().classList.remove('crosshair-cursor');
    }

    // notify(content, type) {
    //     console.log(content);
    //     if (type === "origin") {
    //         toast(content, {
    //             position: "top-center",
    //             duration: 1000
    //         });
    //     } else if (type === "success") {
    //         toast.success(content, {
    //             position: "top-center",
    //             duration: 1000
    //         });
    //     } else if (type === "error") {
    //         toast.error(content, {
    //             position: "top-center",
    //             duration: 2000
    //         })
    //     }

    // }


    componentWillUnmount() {
        PubSub.unsubscribe(this.token1)
        PubSub.unsubscribe(this.unionSingleToken)
        PubSub.unsubscribe(this.joinToken)
        PubSub.unsubscribe(this.emptyAugToken)
        PubSub.unsubscribe(this.joinSingleToken)
        PubSub.unsubscribe(this.unionToken)
    }


    componentDidMount() {
        console.log("call componentDidMount")
        console.log(this.isURQ);

        if (this.props.onRef !== undefined) {
            // 在子组件中调用父组件的方法，并把当前的实例传进去
            this.props.onRef(this)
        }

        // if (this.clusterGroup != null) {
        //     this.clusterGroup.eachLayer((marker) => {
        //         marker.on("mouseover", () => {
        //             marker.openPopup()
        //         })
        //     })
        // }


        this.token1 = PubSub.subscribe('dsquery2Map', (_, stateObj) => {
            // console.log(stateObj)
            this.setState(stateObj)
            if (stateObj.opMode === 0) {
                this.dsQueryNode = stateObj.dsQueryNode
                this.opMode = stateObj.opMode
            }
            console.log(this.dsQueryNode)
        })

        this.token2 = PubSub.subscribe("getQueryData", (_, obj) => {
            this.queryData = obj.queryData;
            this.rmClusterGroup();
            this.rmMarkers();
            this.drawNew('red');
        })

        // 添加一个union数据集
        this.unionSingleToken = PubSub.subscribe('unionSingle', (_, obj) => {
            // console.log("union obj = " + obj)
            // this.opMode = obj.opMode
            // console.log(obj.node)
            // 根本没传到node
            // console.log(obj.node.datasetID)
            let isValidNode = true
            for (let i = 0; i < this.unionNodes.length; i++) {
                if (this.unionNodes[i] === obj.id) {
                    isValidNode = false
                    break
                }
            }
            console.log(isValidNode)
            if (isValidNode === true) {
                console.log(obj.node)
                this.unionNodes.push(obj.id)
            }
            console.log(this.unionNodes)
        })

        // 添加一个join数据集
        this.joinSingleToken = PubSub.subscribe('joinSingle', (_, obj) => {
            let isValidNode = true
            for (let i = 0; i < this.joinNodes.length; i++) {
                if (this.joinNodes[i] === obj.id) {
                    isValidNode = false
                    break
                }
            }
            if (isValidNode === true) {
                this.joinNodes.push(obj.id)
            }
            console.log(this.joinNodes)
        })

        // 多个数据集进行union
        this.unionToken = PubSub.subscribe('union', (_, obj) => {
            this.opMode = obj.opMode
            console.log(this.opMode)
            this.drawOp(this.opMode)
        })

        // 多个数据集进行join
        this.joinToken = PubSub.subscribe("join", (_, obj) => {
            this.opMode = obj.opMode
            console.log(this.opMode)
            this.drawOp(this.opMode)
        })

        this.emptyAugToken = PubSub.subscribe('emptyAug', (_, obj) => {
            this.opMode = obj.opMode
            this.refreshMap()
        })

        // this.isURQToken = PubSub.subscribe('isURQ', (_, obj) => {
        //     // this.setState({
        //     //     isURQ: obj.isURQ
        //     // })
        //     that.isURQ = obj.isURQ;
        // })

        this.refreshToken = PubSub.subscribe('refresh', (_, obj) => {
            this.refreshMap();
        })

        //设置地图和瓦片图层
        // 40,-80
        // 34, 108
        // [25, -80], 4
        // this.map = window.L.map('map', { editable: true }).setView([27, 111], 4)
        this.map = window.L.map('map', { editable: true }).setView([38, -77], 4)
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
        this.map.addLayer(window.L.tileLayer.chinaProvider('GaoDe.Normal.Map', { maxZoom: 19, minZoom: 1 }))

        // 高德源，优势：不需要vpn；劣势：国外地图标注较少，放大倍数不够
        // this.map.addLayer(window.L.tileLayer('http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}', {maxZoom: 14, minZoom: 1}))

        // 使用默认osm地图源，需要翻墙加载
        // this.map.addLayer(window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, minZoom: 1 }))
        // console.log("1")
        // window.L.LeafletShades().addTo(this.map)
        // this.shades = new LeafletShades()
        // 测试添加geoserver图层
        // window.L.tileLayer.wms("http://49.232.124.243:8080/geoserver/PatentMap/wms", {
        //     layers: "patent_point",
        //     format: "image/png",
        //     transparent: true
        // }).addTo(this.map);
        // window.L.tileLayer.wms("http://49.232.124.243:8080/geoserver/spadas/wms", {
        //     layers: "baidu",
        //     format: "image/png",
        //     transparent: true
        // }).addTo(this.map);
        // this.shades = new window.L.LeafletShades().addTo(this.map);
        // console.log(this.shades);
        // this.shades.addTo(this.map);

        // window.L.control.mousePosition().addTo(this.map);

        var that = this
        var mbrmax = []
        var mbrmin = []
        // var ciLayer = window.L.canvasIconLayer({}).addTo(this.map)


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
            if (that.isRangeQueryButtonClicked == false) {
                // that.map.getContainer().style.cursor = 'crosshair';
                // that.notify("Please draw a rectangle.", "origin");
                toast("Please draw a rectangle.");
                mapContainer.classList.add('crosshair-cursor');
                console.log(that.map.getContainer().style.cursor);
                // console.log(that.map.editTools.startRectangle());
                that.rec = that.map.editTools.startRectangle()
                console.log(that.rec);
                // that.rec = that.map.
            } else {
                toast.success("Drawing Cancelled.");
            }
            that.isRangeQueryButtonClicked = !that.isRangeQueryButtonClicked
        }).addTo(this.map);

        this.map.on('editable:drawing:end', function (e) {
            console.log(e);
            console.log(that.rec);
            var mbrmax = [that.rec._bounds._northEast.lat, that.rec._bounds._northEast.lng];
            var mbrmin = [that.rec._bounds._southWest.lat, that.rec._bounds._southWest.lng];
            PubSub.publish('getRange', {
                rangeMax: mbrmax,
                rangeMin: mbrmin
            })
        })

        // this.shades.on('editable:drawing:commit', function(e) {
        //     console.log(this.shades._bounds);
        //     console.log(e.bounds);
        // })

        // this.shades.on('click', function() {
        //     console.log('hello');
        // })

        // 试图给easy button增加鼠标悬浮时候的浮窗，来提高用户体验，但失败了，太他妈复杂了

        // var buttonElement = this.drawRecButton.getContainer();
        // this.drawRecBtnPopup = window.L.popup();

        // buttonElement.addEventListener('mouseover', (e) => {
        //     console.log(e);
        //     console.log(buttonElement.getPosition());
        //     if (this.isRangeQueryButtonClicked == false) {
        //         this.drawRecBtnPopup.setContent('Create Range').setLatLng(e.getPosition()).openOn(this.map);
        //     } else {
        //         this.drawRecBtnPopup.setContent('Remove Range').setLatLng(this.drawRecButton.getPosition()).openOn(this.map);
        //     }
        // })

        // buttonElement.addEventListener('mouseout', () => {
        //     this.map.closePopup(this.drawRecBtnPopup);
        // })

        // this.drawRecButton.on('mouseover', () => {

        // })

        // this.drawRecButton.on('mouseout', () => {

        // })

        // 搜索按钮
        // 负责urq和rq在画框以后的搜索步骤
        var searchBtn = window.L.easyButton('<span class="star2">&telrec;</span>', handleSearch).addTo(this.map);

        function handleSearch() {
            if (that.rec === null) {
                mbrmax = [90, 180]
                mbrmin = [-90, -180]
            } else {
                mbrmax = [that.rec._bounds._northEast.lat, that.rec._bounds._northEast.lng]
                mbrmin = [that.rec._bounds._southWest.lat, that.rec._bounds._southWest.lng]
                console.log(that.shades);
            }
            // 范围查询调用的api
            console.log("isURQ = " + that.isURQ);
            axios.post(global.config.url + 'rangequery', { k: global.config.k, dim: 2, querymax: mbrmax, querymin: mbrmin, mode: global.config.rangeMode })
                .then(res => {
                    console.log(mbrmax)
                    console.log(mbrmin)
                    console.log(res)
                    // that.removeShades()
                    let pure_nodes = res.data.nodes.map(item => item.node)
                    PubSub.publish('searchhits', {
                        data: pure_nodes,
                        isTopk: false
                    });
                });
        }

        // searchBtn.on('click', function() {
        //     if (that.rec === null) {
        //         mbrmax = [90, 180]
        //         mbrmin = [-90, -180]
        //     } else {
        //         mbrmax = [that.rec._bounds._northEast.lat, that.rec._bounds._northEast.lng]
        //         mbrmin = [that.rec._bounds._southWest.lat, that.rec._bounds._southWest.lng]
        //         console.log(that.shades);
        //     }
        //     // 范围查询调用的api
        //     console.log(this.isURQ);
        //     if (this.isURQ === false) {
        //         axios.post(global.config.url + 'rangequery', { k: global.config.k, dim: 2, querymax: mbrmax, querymin: mbrmin })
        //         .then(res => {
        //             console.log(mbrmax)
        //             console.log(mbrmin)
        //             console.log(res)
        //             // that.removeShades()
        //             let pure_nodes = res.data.nodes.map(item => item.node)
        //             PubSub.publish('searchhits', {
        //                 data: pure_nodes,
        //                 isTopk: false
        //             });
        //         });
        //     } else {
        //         // union range query调用的api，对于指定的D，找到其落在range中的所有点
        //         PubSub.publish('getRange', {
        //             rangeMax : mbrmax,
        //             rangeMin: mbrmin
        //         })
        //     }
        // })

        // that.ciLayer = window.L.canvasMarkerLayer({}).addTo(that.map)

        // 整个地图上的网格，暂时不太需要，太丑了
        // var options = {
        //     interval: 10,
        //     showOriginLabel: true,
        //     redraw: 'moveend',
        //     zoomIntervals: [
        //         { start: 2, end: 5, interval: 10 },
        //         { start: 6, end: 6, interval: 1 },
        //         { start: 7, end: 7, interval: 0.5 },
        //         { start: 8, end: 8, interval: 0.2 },
        //         { start: 9, end: 9, interval: 0.1 },
        //         { start: 10, end: 10, interval: 0.05 },
        //         { start: 11, end: 15, interval: 0.02 },
        //     ]
        // };
        // window.L.simpleGraticule(options).addTo(that.map)

        // that.ciLayer.addLayers([tempMarker])
        // that.map.addMarker(tempMarker)
        // that.ciLayer.addTo(that.map)

        // axios.get(global.config.url + 'test')
        //     .then(res => {
        //         console.log(res.data)
        //         var markerArray = []
        //         res.data.forEach(item => {
        //             let marker = window.L.circleMarker(item, { radius: 3, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: 'orange', fillOpacity: 1 })
        //             markerArray.push(marker)
        //         })
        //         that.markerGroup = window.L.layerGroup(markerArray)
        //         that.map.addLayer(that.markerGroup)
        //     })

        console.log("call loaddata")
        // let myDate = new Date()
        // console.log(myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + "." + myDate.getMilliseconds());
        // console.log(new Date().getTime())
        // console.log(this.nodes)

        // 分多次调用/load请求
        // for (var i = 0; i < 6; i++) {
        //     console.log("load data " + i)
        //     axios.get(global.config.url + 'load' + '?id=' + i)
        //         .then(res => {
        //             // console.log(res.data.cityNodeList)
        //             for (let x of res.data.cityNodeList) {
        //                 // console.log(x)
        //                 this.nodes.push(x)
        //             }
        //             this.refreshMap()
        //             // this.nodes.push(res.data.cityNodeList)
        //         })
        // }

        // i = 1
        // 只传city node
        axios.get(global.config.url + 'load' + '?id=1')
            .then(res => {
                // console.log(res.data.cityNodeList)
                // for (let x of res.data.cityNodeList) {
                //     console.log(x)
                //     this.nodes.push(x)
                // }
                for (let x of res.data) {
                    // console.log(x)
                    this.nodes.push(x)
                }

                this.refreshMap();
                this.loadExample();
                // this.nodes.push(res.data.cityNodeList)
            })

        // axios.interceptors.response.use(response => {
        //     console.log("emmmm")
        //     return response
        // })
        // while (this.nodes.length == 0) {

        // }
        // console.log(this.nodes)
        // this.refreshMap()
        // Promise.all(this.nodes).then(res => {
        //     console.log(this.nodes)
        //     this.refreshMap()
        // })


        // axios.get(global.config.url + 'load')
        //     .then(res => {
        //         console.log(res.data)
        //         let myDate = new Date()
        //         console.log(myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + "." + myDate.getMilliseconds())
        //         // console.log(new Date().getTime())
        //         // var temp = window.L.markerClusterGroup()
        //         // that.markers = window.L.markerClusterGroup()
        //         // that.markers = window.L.marker
        //         // var myIcon = window.L.divIcon({className: 'markerIcon'})
        //         // var myIcon = new window.L.Icon({
        //         //     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
        //         //     // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        //         //     iconSize: [10, 16]
        //         // })
        //         // var markerArr = []

        //         // that.nodes = res.data.nodes
        //         // that.drawMarkers()

        //         this.nodes = res.data.cityNodeList
        //         // this.datasetIdMapping = res.data.datasetIdMapping
        //         console.log(this.datasetIdMapping)
        //         // that.drawCityNodes(this.nodes)
        //         that.refreshMap()

        //         myDate = new Date()
        //         console.log(myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + "." + myDate.getMilliseconds())

        //         // for (var i = 0; i < 10000; i++) {
        //         //     var marker = window.L.marker([res.data.data[i][0], res.data.data[i][1]], { icon: myIcon })
        //         //     markerArr.push(marker)
        //         // }
        //         // var myIcon = window.L.icon({
        //         //     iconUrl: pic
        //         // })
        //         // window.$.each(that.nodes, function (index, val) {
        //         //     // 先纬度后经度
        //         //     //i+=1
        //         //     // console.log(val)
        //         //     // console.log(index)
        //         //     // let marker = window.L.marker(new window.L.LatLng(val.pivot[0], val.pivot[1]), { id: val.datasetID }).bindPopup(res.data.filenames[val.datasetID]).openPopup()
        //         //     let marker = window.L.circleMarker([val.pivot[0], val.pivot[1]], { radius: 5, id: val.datasetID, weight: 0, fillColor: 'red', fillOpacity: 1 })
        //         //     // var marker = window.L.marker(new window.L.LatLng(val.pivot[0], val.pivot[1]), { id: val.datasetID, icon: myIcon, title: 'hello' }).bindPopup("goodbye").openPopup()
        //         //     marker.on("click", function (e) {
        //         //         console.log("call getds url")
        //         //         axios.get(global.config.url + 'getds' + '?id=' + e.target.options.id)
        //         //             .then(res2 => {
        //         //                 console.log("xxxxxxx!")
        //         //                 console.log(res2.data.node);
        //         //                 PubSub.publish('mapClickNode', res2.data.node)
        //         //             })
        //         //     })
        //         //     markerArr.push(marker)
        //         //     // marker.addTo(that.map)
        //         // })
        //         // that.markerGroup = window.L.layerGroup(markerArr)
        //         // that.map.addLayer(that.markerGroup)
        //     });

        // myDate = new Date()
        // console.log(myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + "." + myDate.getMilliseconds())
        // axios.get(global.config.url + 'load')
        //     .then(res => {
        //         myDate = new Date()
        //         console.log(myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + "." + myDate.getMilliseconds())
        //         console.log(res.data)
        //     })
    }

    //通过点击搜索结果渲染
    // componentWillReceiveProps
    // 芜湖！上面注释里的方法已经过时了！
    componentDidUpdate() {
        const { clickId } = this.props
        console.log(this.props);
        console.log(clickId)
        this.state.mode = 0
        this.searchSingleDsReset()
        this.rmDssearchMatrix()
        this.rmMarkers()
        // this.removeShades()

        this.drawOp(this.opMode, clickId)

        //console.log(this.trajactoryList)
        // var that = this
        //console.log(this);
        // if (clickId !== null) {
        //     axios.get(global.config.url + 'getds' + '?id=' + clickId)
        //         .then(res => {
        //             console.log(res.data);
        //             var root = res.data.node.node
        //             var rootPivot = root.pivot
        //             var rootRadius = root.radius
        //             var rootType = root.type
        //             // var nodes = []
        //             // getLeafNodes(root, nodes)
        //             // console.log(nodes)

        //             var points = res.data.node.matrix
        //             console.log(points)

        //             // var matrix
        //             // var points = res.data.node
        //             // if (res.data.node.matrix.length < 1000) {
        //             //     matrix = res.data.node.matrix
        //             // } else {
        //             //     matrix = res.data.node.matrix.slice(0, 1000)
        //             // }
        //             // var matrix = res.data.node.matrix
        //             // var node = getLeafNodes(root)
        //             // var node
        //             // console.log(node)
        //             // var pivot = node.pivot
        //             if (rootType === 0) {
        //                 // 线类型
        //                 // getPaths(matrix, matrix.length).forEach(arr => that.trajactoryList.push(window.L.polyline(arr, { weight: 2, color: '#b8518f' }).addTo(that.map)))

        //                 // that.trajactoryList.push(window.L.polyline(getMainPath(matrix), { weight: 4, color: 'red' }).addTo(that.map))
        //                 // that.circleShade = window.L.circle(node.pivot, { radius: node.radius * 110000, opacity: 0.5 }).addTo(that.map)
        //                 // // zoom the map to the polyline
        //                 // that.map.fitBounds(that.trajactoryList[0].getBounds());
        //             } else {
        //                 //点类型
        //                 // matrix.forEach(p => {
        //                 //     that.ClickedPointMarker.push(window.L.marker(p).addTo(that.map))
        //                 // })
        //                 // that.circleShade = window.L.circle(node.pivot, { radius: node.radius * 110000, opacity: 0.5 }).addTo(that.map)
        //                 // that.map.flyTo(pivot, 12, { duration: 4 })

        //                 // nodes.forEach(p => {
        //                 //     let pivot = p.pivot
        //                 //     that.ClickedPointMarker.push(window.L.circleMarker(pivot, { radius: 2, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: 'orange', fillOpacity: 1 }).addTo(that.map))
        //                 // })

        //                 points.forEach(p => {
        //                     that.ClickedPointMarker.push(window.L.circleMarker(p, { radius: 2, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: 'orange', fillOpacity: 1 }).addTo(that.map))
        //                 })

        //                 // that.ClickedPointMarker.addTo(that.map)
        //                 that.circleShade = window.L.circle(rootPivot, { radius: rootRadius * 100000, opacity: 0.8, fillOpacity: 0, weight: 1 }).addTo(that.map)
        //                 that.map.flyTo(rootPivot, 9, { duration: 4 })
        //             }

        //         })
        // }
        //console.log(this.trajactoryList)
    }



    render() {
        console.log("call render")

        const { querynode, nodesVo, mode } = this.state
        var that = this

        //通过dsquery渲染
        // if (mode === 1) {
        //     this.rmMarkers()
        //     this.removeShades()
        //     this.rmDssearchMatrix()
        //     console.log(this.state)
        //     nodesVo.forEach((item, idx) => {
        //         var node = item.node
        //         var matrix = item.matrix
        //         if (node.type === 0) {
        //             // 线类型
        //             getPaths(matrix, matrix.length).forEach(arr => {
        //                 that.trajactoryList.push(window.L.polyline(arr, { weight: 3, color: 'green' }).bindTooltip(item.filename).openTooltip().addTo(that.map))
        //             })
        //         } else {
        //             //点类型
        //             console.log("render points")
        //             matrix.forEach(p => {
        //                 that.ClickedPointMarker.push(window.L.marker(p).bindTooltip(item.filename).openTooltip().addTo(that.map))
        //             })
        //         }

        //     });

        //     //渲染querydata
        //     if (querynode.querytype === 0) {
        //         console.log("what the fuck?")
        //         this.querynodeLine = window.L.polyline(getPaths(querynode.querydata, 10), { weight: 3, color: 'blue' }).bindTooltip(querynode.queryname).openTooltip().addTo(that.map);
        //         this.map.fitBounds(this.querynodeLine.getBounds());
        //     }
        //     else {
        //         var cnt = 0;
        //         querynode.querydata.forEach(p => {
        //             if (cnt === 0) {
        //                 that.querypointMarkers.push(window.L.marker(p).bindTooltip(querynode.queryname, { permanent: true }).openTooltip().addTo(that.map))
        //                 cnt++
        //             }
        //             else
        //                 that.querypointMarkers.push(window.L.marker(p).bindTooltip(" ", { permanent: true }).openTooltip().addTo(that.map))
        //         })
        //         this.map.flyTo(querynode.querydata[0], 17, { duration: 0 })
        //     }

        // }
        return (
            // <div id="map" style={{ height: "870px" }}></div>
            <div id="map" style={{ height: "800px" }}></div>
        )
    }
}
