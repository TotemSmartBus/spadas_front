import React, { Component, useEffect } from 'react'
import PubSub, { publish } from 'pubsub-js'
import pic from './square.svg'

import axios from 'axios'
import './index.css'
import '../globalconfig'

// import AutoGraticule from 'leaflet-auto-graticule';
// import LeafletShades from 'leaflet-shades/src/js/leaflet-shades'

// import './leaflet.canvas-markers.js'
// import P from"leaflet-canvas-marker"
import { CanvasMarkerLayer } from "@panzhiyue/leaflet-canvasmarker"
import { globalConfig } from 'antd/lib/config-provider'
// import L from "leaflet";
// import "leaflet-shades"

// import '../../../node_modules/leaflet-canvas-marker'

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

const myIcon = new window.L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [10, 16]
})

export default class index extends Component {

    constructor(props) {
        super(props)

        this.map = null
        //rectangle of range query
        this.rec = null
        //shades outside the rec of range query
        this.shades = null
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

    removeShades() {
        if (this.shades !== null)
            this.map.removeLayer(this.shades)
        if (this.rec !== null)
            this.rec.remove()
    }
    btnResetMap() {
        if (this.shades !== null)
            this.map.removeLayer(this.shades)
        if (this.rec !== null)
            this.rec.remove()
        // this.shades = new window.L.LeafletShades();
        // this.shades.addTo(this.map);
    }

    drawOp(opMode, clickId) {
        console.log("opMode = " + opMode)

        if (opMode === 0 && this.dsQueryNode) {
            let clickId = this.dsQueryNode.datasetID
            let clickIds = []
            clickIds.push(clickId)
            this.drawDetail(clickIds, 'red')
        } else if (opMode === 1 && this.unionNodes.length > 0) {
            let clickIds = []
            this.unionNodes.forEach((n) => {
                let clickId = n.datasetID
                console.log(clickId)
                clickIds.push(clickId)
            })
            this.drawDetail(clickIds, 'red')
        } else if (opMode === 2 && this.joinNodes.length == 2) {
            let clickIds1 = []
            let clickIds2 = []
            clickIds1.push(this.joinNodes[0].datasetID)
            clickIds2.push(this.joinNodes[1].datasetID)
            this.drawDetail(clickIds1, 'blue')
            this.drawDetail(clickIds2, 'red')
        }
        if (clickId) {
            let clickIds = []
            clickIds.push(clickId)
            this.drawDetail(clickIds, 'blue')
        }
    }

    drawDetail(clickIds, color) {
        console.log("draw detail of one dataset")
        clickIds.forEach((item) => {
            console.log("clickId = " + item)
            axios.get(global.config.url + 'getds' + '?id=' + item)
                .then(res => {
                    console.log(res.data);
                    var root = res.data.node.node
                    var rootPivot = root.pivot
                    var rootRadius = root.radius
                    // var rootType = root.type
                    // var nodes = []
                    // getLeafNodes(root, nodes)
                    // console.log(nodes)

                    var points = res.data.node.matrix

                    points.forEach(p => {
                        this.ClickedPointMarker.push(window.L.circleMarker(p, { radius: 2, color: 'black', weight: 0.5, opacity: 0.5, fill: true, fillColor: color, fillOpacity: 1 }).addTo(this.map))
                    })

                    // that.ClickedPointMarker.addTo(that.map)
                    // this.circleShade = window.L.circle(rootPivot, { radius: rootRadius * 100000, opacity: 0.8, fillOpacity: 0, weight: 1, color: strokeColor }).addTo(this.map)
                    this.circleShades.push(window.L.circle(rootPivot, { radius: rootRadius * 100000, opacity: 0.8, fillOpacity: 0, weight: 1, color: color }).addTo(this.map))
                    this.map.flyTo(rootPivot, 9, { duration: 4 })
                })
        })
    }

    drawMarkers(nodes) {
        console.log(nodes)

        var markerArr = []
        window.$.each(nodes, function (index, val) {
            // console.log(val)
            // 先纬度后经度
            //i+=1
            // console.log(val)
            // console.log(index)
            // let marker = window.L.marker(new window.L.LatLng(val.pivot[0], val.pivot[1]), { id: val.datasetID }).bindPopup(res.data.filenames[val.datasetID]).openPopup()
            let marker = window.L.circleMarker([val.pivot[0], val.pivot[1]], {
                radius: 5,
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
                axios.get(global.config.url + 'getds' + '?id=' + e.target.options.id)
                    .then(res2 => {
                        console.log("xxxxxxx!")
                        console.log(res2.data.node);
                        PubSub.publish('mapClickNode', res2.data.node)
                    })
            })
            markerArr.push(marker)
            // marker.addTo(that.map)
        })
        this.markerGroup = window.L.layerGroup(markerArr)
        this.map.addLayer(this.markerGroup)
    }

    drawCityNodes(nodes) {
        console.log(nodes)
        console.log(Object.prototype.toString.call(nodes[0]))
        var markerArr = []
        var len = nodes.length
        console.log(len)

        for (let node of nodes) {
            // let node = nodes[i]
            console.log(node.cityName + " " + node.nodeList.length)
            let marker = window.L.marker(node.pivot)
            marker.on("mouseover", () => {
                marker.bindPopup(node.cityName).openPopup()
            })
            marker.on("click", () => {
                // console.log(nodes[i])
                // PubSub.publish('mapClickNode', nodes[i].nodeList)
                // PubSub.publish('searchhits', nodes[i].nodeList)
                axios.post(global.config.url + 'rangequery', {
                    k: node.nodeCount,
                    dim: 2,
                    querymax: node.maxBox,
                    querymin: node.minBox,
                    cityName: node.cityName,
                }).then(res => {
                    console.log(res)
                    PubSub.publish('searchhits', { data: res.data.nodes })
                    this.rmMarkers()
                    this.map.flyTo(node.pivot, 9)
                    this.drawMarkers(res.data.subCityNodes)
                })
            })
            markerArr.push(marker)
        }
        this.markerGroup = window.L.layerGroup(markerArr)
        this.map.addLayer(this.markerGroup)
        console.log(this.map)
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

        this.dsQueryNode = null
        this.isDsQuery = true
        this.joinNodes = []
        this.unionNodes = []
        this.opMode = -1

        // this.drawMarkers()
        this.drawCityNodes(this.nodes)
        this.map.setView([27, 111], 4)
    }


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

        if (this.props.onRef !== undefined) {
            // 在子组件中调用父组件的方法，并把当前的实例传进去
            this.props.onRef(this)
        }

        this.token1 = PubSub.subscribe('dsquery2Map', (_, stateObj) => {
            // console.log(stateObj)
            this.setState(stateObj)
            if (stateObj.opMode === 0) {
                this.dsQueryNode = stateObj.dsQueryNode
                this.opMode = stateObj.opMode
            }
            console.log(this.dsQueryNode)
        })

        this.unionSingleToken = PubSub.subscribe('unionSingle', (_, obj) => {
            // console.log("union obj = " + obj)
            // this.opMode = obj.opMode
            // console.log(obj.node)
            let isValidNode = true
            for (let i = 0; i < this.unionNodes.length; i++) {
                if (this.unionNodes[i].datasetID === obj.node.datasetID) {
                    isValidNode = false
                    break
                }
            }
            if (isValidNode === true) {
                this.unionNodes.push(obj.node)
            }
            console.log(this.unionNodes)
        })

        this.joinSingleToken = PubSub.subscribe('joinSingle', (_, obj) => {
            let isValidNode = true
            for (let i = 0; i < this.joinNodes.length; i++) {
                if (this.joinNodes[i].datasetID === obj.node.datasetID) {
                    isValidNode = false
                    break
                }
            }
            if (isValidNode === true) {
                this.joinNodes.push(obj.node)
            }
            console.log(this.joinNodes)
        })

        this.unionToken = PubSub.subscribe('union', (_, obj) => {
            this.opMode = obj.opMode
            console.log(this.opMode)
            this.drawOp(this.opMode)
        })

        this.joinToken = PubSub.subscribe("join", (_, obj) => {
            this.opMode = obj.opMode
            console.log(this.opMode)
            this.drawOp(this.opMode)
        })

        this.emptyAugToken = PubSub.subscribe('emptyAug', (_, obj) => {
            this.opMode = obj.opMode
            this.refreshMap()
        })

        //设置地图和瓦片图层
        // 40,-80
        // 34, 108
        // [25, -80], 4
        this.map = window.L.map('map', { editable: true }).setView([27, 111], 4)
        var OpenStreetMap = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 2,
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map)
        console.log("1")
        // window.L.LeafletShades().addTo(this.map)
        // this.shades = new LeafletShades()
        // this.shades = new window.L.LeafletShades()
        // this.shades.addTo(this.map);
        // window.L.control.mousePosition().addTo(this.map);

        var that = this
        var mbrmax = []
        var mbrmin = []
        // var ciLayer = window.L.canvasIconLayer({}).addTo(this.map)


        // 添加按钮控件
        // 画框按钮
        window.L.easyButton('<span class="star1">&odot;</span>', function () {
            //点击开始绘图
            that.btnResetMap()
            if (that.isRangeQueryButtonClicked == false) {
                that.rec = that.map.editTools.startRectangle()
            }
            that.isRangeQueryButtonClicked = !that.isRangeQueryButtonClicked
        }).addTo(this.map)

        // 搜索按钮
        window.L.easyButton('<span class="star2">&telrec;</span>', function () {
            if (that.rec === null) {
                mbrmax = [90, 180]
                mbrmin = [-90, -180]
            } else {
                mbrmax = [that.rec._bounds._northEast.lat, that.rec._bounds._northEast.lng]
                mbrmin = [that.rec._bounds._southWest.lat, that.rec._bounds._southWest.lng]
            }
            axios.post(global.config.url + 'rangequery', { k: global.config.k, dim: 2, querymax: mbrmax, querymin: mbrmin })
                .then(res => {
                    console.log(mbrmax)
                    console.log(mbrmin)
                    console.log(res)
                    // that.removeShades()
                    PubSub.publish('searchhits', { data: res.data.nodes })
                })
        }).addTo(this.map);

        that.ciLayer = window.L.canvasMarkerLayer({}).addTo(that.map)

        var options = {
            interval: 10,
            showOriginLabel: true,
            redraw: 'moveend',
            zoomIntervals: [
                { start: 2, end: 5, interval: 10 },
                { start: 6, end: 6, interval: 1 },
                { start: 7, end: 7, interval: 0.5 },
                { start: 8, end: 8, interval: 0.2 },
                { start: 9, end: 9, interval: 0.1 },
                { start: 10, end: 10, interval: 0.05 },
                { start: 11, end: 15, interval: 0.02 },
            ]
        };
        // window.L.AutoGraticule
        window.L.simpleGraticule(options).addTo(that.map)
        // window.L.autoGraticule(grid_options).addTo(that.map)

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
        let myDate = new Date()
        console.log(myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + "." + myDate.getMilliseconds());
        // console.log(new Date().getTime())
        console.log(this.nodes)

        // 分多次调用/load请求
        for (var i = 0; i < 6; i++) {
            console.log("load data " + i)
            axios.get(global.config.url + 'load' + '?id=' + i)
                .then(res => {
                    // console.log(res.data.cityNodeList)
                    for (let x of res.data.cityNodeList) {
                        // console.log(x)
                        this.nodes.push(x)
                    }
                    this.refreshMap()
                    // this.nodes.push(res.data.cityNodeList)
                })
        }

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
