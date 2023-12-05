// import axios from 'axios'
// import PubSub from 'pubsub-js'
// import {useState} from 'react'
// import L from 'leaflet'
// import {MapContainer, TileLayer} from 'react-leaflet'
// import 'leaflet-easybutton'
// import 'leaflet.markercluster'
// import '../../global'
// import {convertToZoomLevel, GetDistance} from '../../../tools'
//
//
// const trajectory = {}
// const NewMap = (props) => {
//     const [datasets, setDatasets] = useState(props.visibleDatasets)
//     const [clusterGroup, setClusterGroup] = useState(L.markerClusterGroup({
//         maxClusterRadius: 30,
//         disableClusteringAtZoom: 14,
//     }))
//     const layer = window.L.layerGroup()
//
//     function clusterClick(a) {
//         var markers = a.layer.getAllChildMarkers()
//         let clickNodes = []
//         for (var i = 0; i < markers.length; i++) {
//             clickNodes.push(this.nodeMap[markers[i].options.id])
//         }
//         PubSub.publish("searchhits", {data: clickNodes})
//     }
//
//     function loadData(id) {
//         axios.get(global.config.url + 'load?id=' + id)
//             .then(res => {
//                 setDatasets(datasets.push(res.data))
//             }).catch(e => {
//             console.error(e)
//         })
//     }
//
//     function loadTrajectory(id) {
//         axios.get(global.config.url + 'trajectory?id=' + id)
//             .then(res => {
//                 trajectory[id] = res.data
//             }).catch(e => {
//             console.error(e)
//         })
//     }
//
//     function refreshMap() {
//         // queryPointMarker
//         // this.rmDssearchMatrix()
//         // // markGroup
//         // this.rmMarkers()
//         // // circleShade, clickPointMarker
//         // this.searchSingleDsReset()
//         // this.rmHeatmap()
//         // this.rmClusterGroup()
//
//         drawClusters(datasets)
//         // this.map.setView(new_york_center, 12)
//         props.map.getContainer().classList.remove('crosshair-cursor')
//     }
//
//     function drawClusters(nodes) {
//         setClusterGroup(L.markerClusterGroup({
//             maxClusterRadius: 30,
//             disableClusteringAtZoom: 14,
//         }))
//         // 先添加全部文件节点到地图上
//         for (let node of nodes) {
//             try {
//                 var fileMarker = L.marker(node.pivot, {
//                     name: node.fileName,
//                     id: node.datasetID,
//                 }).addTo(layer);
//             } catch (error) {
//                 console.error(error)
//                 console.error("reading" + node.fileName + "failed")
//             }
//             fileMarker.on("click", function (e) {
//                 let clickNodes = []
//                 clickNodes.push(node);
//                 PubSub.publish("searchhits", {data: clickNodes})
//             })
//             fileMarker.bindPopup(`${node.fileName}`)
//             clusterGroup.addLayers(fileMarker)
//             datasets[node.datasetID] = node
//         }
//
//         clusterGroup.on('mouseover', function (event) {
//             var marker = event.layer
//             var markerName = marker.options.name
//             marker.bindPopup(`${markerName}`).openPopup()
//         }).addTo(props.map)
//
//         clusterGroup.on("clusterclick", clusterClick)
//     }
//
//     function drawTrajectory(id) {
//         if (trajectory[id] === null) {
//             console.error("no trajectory for " + id)
//         }
//         let trajectories = trajectory[id]
//         if (trajectories === undefined) {
//             return
//         }
//         for (let t of trajectories) {
//             let points = []
//             for (let i = 0; i < t.length; i++) {
//                 let p = new L.LatLng(t[i][0], t[i][1])
//                 points.push(p)
//             }
//             let trajectoryLine = new L.polyline(points, {
//                 color: 'red',
//                 weight: 3,
//                 smoothFactor: 1,
//             })
//             trajectoryLine.addTo(props.map)
//         }
//     }
//
//     function drawDatasets(datasets) {
//         datasets.forEach(dataset => {
//             axios.get(global.config.url + 'getds?id=' + dataset.datasetID)
//                 .then(res => {
//                     let samplePoints = res.data.node.dataSamp
//                     let rootPoints = res.data.node.matrix
//                     let columns = res.data.node.columns
//                     let color = dataset.color
//
//                     let points = rootPoints ? rootPoints : samplePoints
//                     points.forEach((p, i) => {
//                         let point = L.circleMarker(p, {
//                             radius: 2,
//                             color: 'black',
//                             weight: 0.5,
//                             opacity: 0.5,
//                             fill: true,
//                             fillColor: color,
//                             fillOpacity: 1,
//                         })
//                         point.on('click', (e) => {
//                             var msg = '[' + point.getLatLng()['lat'] + ',' + point.getLatLng()['lng'] + ']<br/>'
//                             if (columns != null) {
//                                 Object.keys(columns).forEach(k => {
//                                     msg += k + ' is ' + JSON.stringify(columns[k][i]) + '<br/>'
//                                 })
//                             }
//                             point.bindPopup(msg).openPopup()
//                         })
//                         point.addTo(props.map)
//                     })
//                 })
//         })
//         let center = datasets[0].pivot
//         let radius = GetDistance(datasets[0].mbrmax[1], datasets[0].mbrmax[0], datasets[0].mbrmin[1], datasets[0].mbrmin[0])
//         let zoom = convertToZoomLevel(radius)
//         props.map.flyTo(center, zoom)
//     }
//
//     loadData(1)
//     loadTrajectory(0)
//     drawTrajectory(0)
//     refreshMap()
//
//     return (
//         <MapContainer
//             doubleClickZoom={false}
//             id={'map'}
//             zoom={global.config.map.defaultZoom}
//             center={global.config.map.defaultCenter}
//         >
//             <TileLayer
//                 url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}/>
//             {/*<MapPanel/>*/}
//         </MapContainer>
//     )
// }
//
// export default NewMap