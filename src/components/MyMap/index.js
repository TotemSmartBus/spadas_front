import React, { Component } from 'react'
import PubSub from 'pubsub-js'

import axios from 'axios'
import './index.css'
import '../globalconfig'

/**
 * 
 * @param {2-d array,lat&lon&time} data 
 * select the offset-th vehicle path to be exhibited
 */
function getPaths(data,maxLen){
    var map = new Map()
    for(var i=0;i<data.length;i++){
        if(map.has(data[i][2])){
            map.get(data[i][2]).push(data[i])
        }
        else
        {
            map.set(data[i][2],[])
            map.get(data[i][2]).push(data[i])
        }
            
    }
    var result = []
    var len = map.size>maxLen? maxLen:map.size
    var itr = map.values()
    while(len>0){
        result.push(itr.next().value)
        len--
    }
    return result
}

/**
 * 获取Argo数据集的AV车轨迹
 * @param {} data 
 */
function getMainPath(data){
    var result = []
    for(var i=0;i<data.length;i++){
        if(data[i][2]===0){
            result.push(data[i])
        }   
    }
    return result
}

export default class index extends Component {

    constructor(props){
        super(props)
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
        this.circleShade = null

        this.querypointMarkers = []

        this.state = {nodesVo:null,querynode:null,mode:null}
    }
    searchSingleDsReset(){
        if(this.trajactoryList.length!=null){
            this.trajactoryList.forEach(t=>t.remove())
            this.trajactoryList.splice(0,this.trajactoryList.length)
        }
        if(this.circleShade!==null)
            this.circleShade.remove()
        if(this.ClickedPointMarker!==null&&this.ClickedPointMarker.length>0){
            this.ClickedPointMarker.forEach(m=>m.remove())
            this.ClickedPointMarker.splice(0,this.ClickedPointMarker.length)
        }
        if(this.querynodeLine!==null)
            this.querynodeLine.remove()

    }

    rmDssearchMatrix(){
        if(this.querypointMarkers.length!=null){
            this.querypointMarkers.forEach(t=>t.remove())
        }
        this.querypointMarkers.splice(0,this.querypointMarkers.length)
    }

    rmMarkers(){
        if(this.markers!==null)
            this.markers.remove()
    }

    removeShades(){
        if(this.shades!==null)
        this.map.removeLayer(this.shades)
        if(this.rec!==null)
        this.rec.remove()
    }
    btnResetMap(){
        if(this.shades!==null)
            this.map.removeLayer(this.shades)
        if(this.rec!==null)
            this.rec.remove()
        this.shades = new window.L.LeafletShades();
        this.shades.addTo(this.map); 
    }


    componentWillUnmount(){
		PubSub.unsubscribe(this.token1)
    }

    componentDidMount(){
        this.token1 = PubSub.subscribe('dsquery2Map',(_,stateObj)=>{
            //console.log(stateObj)
            this.setState(stateObj)
        })

        //设置地图和瓦片图层
        this.map = window.L.map('map', {editable: true}).setView([40, -80], 3);
        var OpenStreetMap = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map)
        this.shades = new window.L.LeafletShades();
        this.shades.addTo(this.map); 
        window.L.control.mousePosition().addTo(this.map);

        var that=this
        var mbrmax=[]
        var mbrmin=[]

        // 添加按钮控件
        // 画框按钮
        window.L.easyButton( '<span class="star">&odot;</span>', function(){
            //点击开始绘图
            that.btnResetMap()
            that.rec = that.map.editTools.startRectangle();
          }).addTo(this.map)
        // 搜索按钮
        window.L.easyButton( '<span class="star2">&telrec;</span>', function(){
            if(that.rec===null){
                mbrmax = [90,180]
                mbrmin = [-90,-180]
            }else{
                mbrmax = [that.rec._bounds._northEast.lat,that.rec._bounds._northEast.lng]
                mbrmin = [that.rec._bounds._southWest.lat,that.rec._bounds._southWest.lng]
            }
            axios.post(global.config.url+'rangequery',{k:global.config.k,dim:2,querymax:mbrmax,querymin:mbrmin})
            .then(res=>{
                //console.log(res)
				PubSub.publish('searchhits',{data:res.data.nodes})
            })   
        }).addTo(this.map);
        
             
        axios.get(global.config.url+'loaddata')
        .then(res=>{
            //console.log(res.data)
            that.markers = window.L.markerClusterGroup()
            //var i=0
            window.$.each(res.data.nodes,function(index,val){
                // 先纬度后经度
                //i+=1
                var marker = window.L.marker(new window.L.LatLng(val.pivot[0],val.pivot[1]),{id:val.datasetID}).bindPopup(res.data.filenames[val.datasetID]).openPopup()
                marker.on("click",function(e){
                    axios.get(global.config.url+'getds'+'?id='+e.target.options.id)
                        .then(res2=>{
                            //console.log(res2.data.node);
                            PubSub.publish('mapClickNode',res2.data.node)
                        })
                    
                })
                that.markers.addLayer(marker)
            })
            this.map.addLayer(that.markers)
        })
        
    }

    //通过点击搜索结果渲染
    componentWillReceiveProps(){
        const {clickId} = this.props
        this.state.mode =0 
        this.searchSingleDsReset()
        this.rmDssearchMatrix()
        this.rmMarkers()
        //console.log(this.trajactoryList)
        var that = this
        //console.log(this);
        if(clickId!==null){
            axios.get(global.config.url+'getds'+'?id='+clickId)
            .then(res=>{
                //console.log(res.data.node);
                var node = res.data.node.node
                var matrix = res.data.node.matrix
                if(node.type===0){
                    // 线类型
                    getPaths(matrix,matrix.length).forEach(arr=>that.trajactoryList.push(window.L.polyline(arr, {weight:2,color: '#b8518f'}).addTo(that.map)))

                    that.trajactoryList.push(window.L.polyline(getMainPath(matrix),{weight:4,color: 'red'}).addTo(that.map)) 
                    that.circleShade = window.L.circle(node.pivot,{radius:node.radius*110000,opacity:0.5}).addTo(that.map)
                    // zoom the map to the polyline
                    that.map.fitBounds(that.trajactoryList[0].getBounds());
                }else{
                    //点类型
                    matrix.forEach(p=>{
                        that.ClickedPointMarker.push(window.L.marker(p).addTo(that.map))
                    })
                    that.circleShade = window.L.circle(node.pivot,{radius:node.radius*110000,opacity:0.5}).addTo(that.map)
                    that.map.flyTo(matrix[0],17,{duration:4})                
                }

            })
        }
        //console.log(this.trajactoryList)
    }

    render() {
        const{querynode,nodesVo,mode} = this.state
        var that=this

        //通过dsquery渲染
        if(mode===1){
            this.rmMarkers()
            this.removeShades()
            this.rmDssearchMatrix()
            nodesVo.forEach((item,idx) => {
                var node = item.node
                var matrix = item.matrix
                if(node.type===0){
                    // 线类型
                    getPaths(matrix,matrix.length).forEach(arr=>{
                        that.trajactoryList.push(window.L.polyline(arr, {weight:3,color: 'green'}).bindTooltip(item.filename).openTooltip().addTo(that.map))
                    })
                }else{
                    //点类型
                    matrix.forEach(p=>{
                        that.ClickedPointMarker.push(window.L.marker(p).bindTooltip(item.filename).openTooltip().addTo(that.map))
                    })               
                }

            });

            //渲染querydata
            if(querynode.querytype===0){
                this.querynodeLine = window.L.polyline(getPaths(querynode.querydata,10), {weight:3,color: 'blue'}).bindTooltip(querynode.queryname).openTooltip().addTo(that.map);
                this.map.fitBounds(this.querynodeLine.getBounds());
            }
            else{
                var cnt=0;
                querynode.querydata.forEach(p=>{
                    if(cnt===0)
                        {that.querypointMarkers.push(window.L.marker(p).bindTooltip(querynode.queryname,{permanent:true}).openTooltip().addTo(that.map))
                        cnt++
                    }
                    else
                        that.querypointMarkers.push(window.L.marker(p).bindTooltip(" ",{permanent:true}).openTooltip().addTo(that.map))
                })
                this.map.flyTo(querynode.querydata[0],17,{duration:0})                
            }
            
        }
        return (
            <div id="map" style={{height:"870px"}}></div>
        )
    }
}
