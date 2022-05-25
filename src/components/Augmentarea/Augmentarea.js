import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios'
import ReactTooltip from 'react-tooltip'

import './Augmentarea.css'
import PreviewTable from '../PreviewTable/PreviewTable'

export default class Augmentarea extends Component {

    state = {unionId:[],unionFilename:[],uniondata:[],joinId:[],joinFilename:[],previewHeaders:[],previewBody:[]}
    list = (length) => {
        //console.log(this.previewBody.length); 
        var res = [];
        for(var i = 0; i < length; i++) {
          res.push(<PreviewTable header={this.state.previewHeaders[i]} key={i} rows={this.state.previewBody[i]}/>)
        }
        //console.log(res);
        return res
      }
    
    

    async updatePreview(){
        if(this.state.unionId.length>0){
            var that = this
            var dto = {ids:this.state.unionId,rows:global.config.preRows}
            await axios.post(global.config.url+"preview",dto)
                .then(async res=>{
                    that.state.previewHeaders=(res.data.headers)
                    that.state.previewBody=(res.data.bodies)
                })
        }
        var that = this
        //console.log(this)
    }

    componentDidMount(){
        this.uniontoken = PubSub.subscribe("union",async (_,obj)=>{
            var udata 
            var uid = this.state.unionId
            var name = this.state.unionFilename
            if(!uid.contain(obj.id)){
                uid.push(obj.id)
                name.push(obj.filename)
                udata = this.state.uniondata.concat(obj.matrix)
            }
            await this.updatePreview()
            this.setState({unionId:uid,unionFilename:name,uniondata:udata})
        })
        this.jointoken = PubSub.subscribe("join",(_,obj)=>{
            var jid = this.state.joinId
            var name = this.state.joinFilename
            if(!jid.contain(obj.id)&&jid.length<2){
                jid.push(obj.id)
                name.push(obj.filename)
            }
            this.setState({joinId:jid,join:name})
            //console.log(this.state)
		})
    }
    componentWillUnmount(){
        PubSub.unsubscribe(this.uniontoken)
        PubSub.unsubscribe(this.jointoken)
    }

    handleUnionSearch = () => {
        debugger;
        axios.post(global.config.url+'/dsquery',{k:global.config.k,dim:2,querydata:this.state.uniondata,mode:global.config.mode})
        .then(res=>{
            //console.log(res)
            PubSub.publish("dsquery2Map",{querydata:this.state.uniondata,matrix:res.data.nodes,mode:1})
            PubSub.publish("searchhits",{data:res.data.nodes})
        })
    }

    handleJoin = () => {
        axios.get(global.config.url+'?queryid='+this.state.joinId[0]+'&datasetid='+this.state.joinId[1])
            .then(res=>{
                //console.log(res.data);
                var joindata = this.state.previewBody
                joindata.push(res.data.joinData)
                var header = this.state.previewHeaders
                header.push(res.data.header)
                this.setState({previewHeaders:header,previewBody:joindata})
            })
    }

    handleDownloadClicked = () =>{
        var baseUrl = global.config.url + "file/"
        for(var idx in this.state.unionFilename){
            var win = window.open(baseUrl+this.state.unionFilename[idx])
        }
    }

    render() {
        return (
            <div>
                <div className="area2">
                    <div className="union changeline">
                        <p>Union:</p>
                        {
                            this.state.unionId.map((item,idx)=>(
                            <span key={item} className="ml-2">{this.state.unionFilename[idx]}</span>    
                            ))
                        }
                    </div>
                    <div className="join changeline">
                        <p>Join:</p>
                        {
                            this.state.joinId.map((item,idx)=>(
                                <span key={item} className="ml-2">{this.state.joinFilename[idx]}</span>    
                                ))
                        }
                    </div>
                </div>
                <div>
                     <button type="button" className="btn radiusBtn sfont" onClick={this.handleUnionSearch}>UnionRangeSearch</button>
                     <button type="button" className="btn radiusBtn sfont" onClick={this.handleJoin}>Join</button>
                     <button type="button" className="btn radiusBtn sfont fr" onClick={this.handleDownloadClicked} >Download</button>
                     <button data-tip data-for='preview' data-event='click' data-event-off='dblclick' place="right" type="button" className="btn radiusBtn sfont fr" >Preview</button>
                    <ReactTooltip id='preview' type="light" place="right" clickable={true} effect="solid" className="maxZ scroll" >
                        {this.list(this.state.previewBody.length)}
                    </ReactTooltip>
                </div>
            </div>
        )
    }
}
