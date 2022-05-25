import React, { Component } from 'react'
import axios from 'axios'
import Pubsub from 'pubsub-js'

import './SearchDetail.css'
import '../globalconfig'

export default class SearchDetail extends Component {

    handleSearchRelatedClicked = () =>{
        axios.post(global.config.url+'/dsquery',{k:global.config.k,dim:2,querydata:this.props.matrix,mode:global.config.mode})
        .then(res=>{
            console.log(res)
            Pubsub.publish("dsquery2Map",{ querynode:{querydata:this.props.matrix,querytype:this.props.type,queryname:this.props.filename},nodesVo:res.data.nodes,mode:1})
            Pubsub.publish("searchhits",{data:res.data.nodes})
        })
    }

    handleDownloadClicked = () =>{
        var url = global.config.url + "file/" + this.props.filename
        window.open(url)
    }

    // 测试
    render() {
        //console.log(this.props);
        var {id,filename,matrix} = this.props
        // if(this.props!==undefined&&id!==null){
        //     rootToDataset = this.props.id
        // }
        return (
            <div style={{position:"relative"}}>
                <div className="card ">
                    <div className="card-header" style={{padding:"0.5rem"}}>
                        <ul className="nav nav-tabs card-header-tabs">
                            <li className="nav-item">
                                <a className="nav-link active" href="#">Metadata</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">ColumnInfo</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Others</a>
                            </li>
                        </ul>
                    </div>
                    
                        {(id===undefined||id===null)?
                        "":
                        (<div className="card-body pre-scrollable" style={{padding:"0.75rem"}}>
                            <h5 className="card-title mb-2">{filename}</h5>
                                <p className="card-text mb-2"><b>Description:</b> With supporting text below as a natural lead-in to additional content.</p>
                            <span href="#" className="btn btn-primary" onClick={this.handleSearchRelatedClicked}>
                                <span className=" sFont"> SearchRelated</span>
                            </span>
                            <span href="#" className="btn btn-primary" style={{marginLeft:"1rem"}} onClick={this.handleDownloadClicked}>
                                <span className=" sFont"> Download</span>
                            </span>
                        </div>)}

                    

                </div>
            </div>
        )
    }
}
