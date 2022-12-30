import React, { Component } from 'react'
import logo from './spadas.svg';
import './Myheader.css'
import index from '../MyMap';

import Pubsub from 'pubsub-js'

import axios from 'axios'
import '../globalconfig'
import { Link } from 'react-router-dom';

import MyMap from '../MyMap/index'

export default class Top extends Component {
    handleRefresh = () => {
        this.props.refreshMapMain()
    }

    handleUpload = (e) => {
        console.log(index.state)
        // var that = this
        if (e.target.files !== null) {
            console.log(e.target.files)
            // star! 此处需new一个formdata，如果直接将e.target.files[0]作为axios的data参将报错
            var data = new FormData()
            // var fileList = []
            // for (let i = 0; i < e.target.files.length; i++) {
            //     fileList.push(e.target.files[i])
            //     // data.append('file', e.target.files[i])
            //     console.log(e.target.files[i])
            // }
            for (let i = 0; i < e.target.files.length; i++) {
                data.append('file', e.target.files[i])
                console.log(i)
                console.log(data.getAll('file'))
            }
            // data.append("file", fileList)
            data.append("file", e.target.files[0])
            // data.append("file", e.target.files)
            // data.append("a","b")
            console.log(data.getAll('file'))
            axios({
                url: global.config.url + "uploaddataset",
                method: "post",
                data: data,
                headers: { "Content-Type": "multipart/form-data" }
            })
            // .then(res => {
            //     console.log(res.data.matrix)
            //     if (res.data !== null && res.data.filename !== null) {
            //         axios({
            //             url: global.config.url + "dsquery",
            //             method: "post",
            //             data: {
            //                 k: global.config.k,
            //                 dim: 2,
            //                 querydata: res.data.matrix,
            //             },
            //         })
            //             .then(res2 => {
            //                 console.log(res2.data.nodes);
            //                 // Pubsub.publish("dsquery2Map",{ querynode:{querydata:res.data.matrix,querytype:0,queryname:res2.data.nodes[res2.data.nodes.length-1].filename},nodesVo:res2.data.nodes,mode:1})
            //                 // console.log(res.data.matrix)
            //                 Pubsub.publish("searchhits", { data: res2.data.nodes })
            //             })
            //     }
            // })

        }
    }
    render() {
        return (
            <div className="header">
                <span className="headerFont">
                    <a href="javascript:location.reload();">
                        <img src={logo} className="logo" alt="Spadas Logo" />
                    </a>

                    Spadas
                </span>

                <span className='mynav refresh'>
                    <button style={{ opacity: "0", width: "100px", height: "25px" }} onClick={this.handleRefresh} />
                    <span className="sfont modposition" >
                        <p>&nbsp;&nbsp;&nbsp;Refresh</p>
                    </span>
                </span>

                <span className="mynav">
                    {/* <svg className="pt bi bi-book-half" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
        </svg> */}
                    <a href="https://myfootnotsmelly.github.io/spadas_page/" className='sfont modposition'>
                        Documentation
                    </a>

                </span>


                {/* upload file btn */}
                <form id="upload-form" className="search mynav" encType="multipart/form-data">
                    <input id="fileInput" type="file" multiple="multiple" style={{ opacity: "0", width: "125px" }} onChange={this.handleUpload} webkitdirectory="webkitdirectory" />
                    {/* <input id="fileInput" type="file" multiple="multiple" style={{ opacity: "0", width: "125px" }} onChange={this.handleUpload} /> */}
                    {/* <input type="file" class="custom-file-input" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01"></input> */}
                    <span className="sfont modposition"  >
                        <p>Upload Dataset</p>
                    </span>
                </form>
            </div>
            //  multiple="multiple"
        )
    }
}
