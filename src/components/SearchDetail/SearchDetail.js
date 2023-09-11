import React, { Component } from 'react'
import axios from 'axios'
import Pubsub from 'pubsub-js'

import './SearchDetail.css'
import '../globalconfig'
import { toast } from 'react-hot-toast'

export default class SearchDetail extends Component {

    handleSearchRelatedClicked = () => {
        console.log(this.props)
        axios.post(global.config.url + 'dsquery', { k: global.config.k, dim: 2, mode: global.config.examplarMode, datasetId: this.props.id })
            .then(res => {
                console.log(res)
                Pubsub.publish("dsquery2Map", {
                    querynode: {
                        querydata: this.props.matrix,
                        querytype: this.props.type,
                        queryname: this.props.filename
                    },
                    nodesVo: res.data.nodes,
                    mode: 1,
                    opMode: 0,
                    dsQueryNode: this.props.node
                })
                let pure_nodes = res.data.nodes.map(item => item.node)
                // Pubsub.publish("searchhits", { data: res.data.nodes })
                Pubsub.publish('searchhits', {
                    data: pure_nodes,
                    isTopk: true
                });
                // 发布union range query事件，让Augmentarea组件类来响应
                // Pubsub.publish('urq', {
                //     // 标识是否是query dataset，在topk search中发布的是query dataset，否则不是
                //     isQ: true,
                //     id: this.props.id,
                //     name: this.props.filename
                // });
                toast.success("Search Related Datasets Success.");
            })
    }

    handleDownloadClicked = () => {
        // var url = global.config.url + "file/" + this.props.filename + "/" + this.props.id
        var url = global.config.url + "file/" + this.props.id
        console.log(url)
        window.open(url)
        // var url = 'https://data-cuyahoga.opendata.arcgis.com/datasets/cuyahoga::100-year-flood-plain.zip'
        // window.open(url)
    }

    // 测试
    render() {
        //console.log(this.props);
        var { id, filename, node } = this.props
        // console.log(node)
        // if(this.props!==undefined&&id!==null){
        //     rootToDataset = this.props.id
        // }
        return (
            <div style={{ position: "relative" }}>
                <div className="card ">
                    <div className="card-header" style={{ padding: "0.5rem" }}>
                        <ul className="nav nav-tabs card-header-tabs">
                            <li className="nav-item">
                                <a className="nav-link active" href="#">DatasetInfo</a>
                            </li>
                            {/* 暂时不要 */}
                            {/* <li className="nav-item">
                                <a className="nav-link" href="#">Metadata</a>
                            </li> */}
                            {/* <li className="nav-item">
                                <a className="nav-link" href="#">Others</a>
                            </li> */}
                        </ul>
                    </div>

                    {(id === undefined || id === null) ?
                        "" :
                        (<div className="card-body pre-scrollable" style={{ padding: "0.75rem" }}>
                            <h5 className="card-title mb-2">{filename}</h5>
                            {/* <p className="card-text mb-2"><b>Description:</b> With supporting text below as a natural lead-in to additional content.</p> */}
                            <p className="card-text mb-2">
                                "Pivot": [{node.pivot[0].toFixed(4)}, {node.pivot[1].toFixed(4)}] <br />
                                "Radius": {node.radius.toFixed(4)} <br />
                                "CoveredPoints": {node.totalCoveredPoints}
                            </p>
                            <span href="#" className="btn btn-primary" onClick={this.handleSearchRelatedClicked}>
                                <span className=" sFont"> SearchRelated</span>
                            </span>
                            <span href="#" className="btn btn-primary" style={{ marginLeft: "1rem" }} onClick={this.handleDownloadClicked}>
                                <span className=" sFont"> Download</span>
                            </span>
                        </div>)}
                </div>
            </div>
        )
    }
}
