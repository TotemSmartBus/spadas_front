import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios'
import ReactTooltip from 'react-tooltip'

import './Augmentarea.css'
import PreviewTable from '../PreviewTable/PreviewTable'

export default class Augmentarea extends Component {
    // unionIds = []
    // unionFilenames = []
    // unionMatrix = []

    state = { unionId: [], unionFilename: [], uniondata: [], joinId: [], joinFilename: [], previewHeaders: [], previewBody: [] }
    list = (length) => {
        //console.log(this.previewBody.length); 
        var res = [];
        for (var i = 0; i < length; i++) {
            res.push(<PreviewTable header={this.state.previewHeaders[i]} key={i} rows={this.state.previewBody[i]} />)
        }
        console.log(res);
        return res
    }



    async updatePreview() {
        if (this.state.unionId.length > 0) {
            var that = this
            var dto = { ids: this.state.unionId, rows: global.config.preRows }
            console.log(dto.rows)
            await axios.post(global.config.url + "preview", dto)
                .then(async res => {
                    that.state.previewHeaders = (res.data.headers)
                    that.state.previewBody = (res.data.bodies)
                })
        }
        var that = this
        console.log(this)
    }

    // preview() {
    //     console.log("call preview")
    //     if (this.unionIds.length > 0) {
    //         var dto = {
    //             ids: this.unionIds,
    //             rows: global.config.preRows
    //         }
    //         console.log(dto)
    //         axios.post(global.config.url + "preview", dto)
    //             .then(res => {
    //                 console.log(res)
    //                 this.setState({
    //                     previewHeaders: res.data.headers,
    //                     previewBody: res.data.bodies
    //                 })
    //             })
    //     }
    //     console.log(this.state)
    // }

    preview() {
        if (this.state.unionId.length > 0) {
            var dto = { ids: this.state.unionId, rows: global.config.preRows }
            console.log(dto.rows)
            axios.post(global.config.url + "preview", dto)
                .then(res => {
                    this.setState({
                        previewHeaders: res.data.headers,
                        previewBody: res.data.bodies
                    })
                })
        }
    }

    componentDidMount() {
        // this.unionSingleToken = PubSub.subscribe("union", async (_, obj) => {
        //     var udata
        //     var uid = this.state.unionId
        //     var name = this.state.unionFilename
        //     if (!uid.contain(obj.id)) {
        //         uid.push(obj.id)
        //         name.push(obj.filename)
        //         udata = this.state.uniondata.concat(obj.matrix)
        //     }
        //     await this.updatePreview()
        //     this.setState({ unionId: uid, unionFilename: name, uniondata: udata })
        // })

        this.unionSingleToken = PubSub.subscribe("unionSingle", (_, obj) => {
            // let isValidNode = true
            // for (let i = 0; i < this.unionIds.length; i++) {
            //     if (this.unionIds[i] === obj.node.datasetID) {
            //         isValidNode = false
            //         break
            //     }
            // }
            // if (isValidNode === true) {
            //     this.unionIds.push(obj.id)
            //     this.unionFilenames.push(obj.filename)
            //     let unionMatrixTemp = this.unionMatrix.concat(obj.matrix)
            //     this.unionMatrix = unionMatrixTemp
            // }
            // console.log(this.unionFilenames)
            // this.preview()
            var udata
            var uid = this.state.unionId
            var name = this.state.unionFilename
            if (!uid.contain(obj.id)) {
                uid.push(obj.id)
                name.push(obj.filename)
                udata = this.state.uniondata.concat(obj.matrix)
            }
            // this.preview()
            this.setState({ unionId: uid, unionFilename: name, uniondata: udata })
        })



        this.joinSingleToken = PubSub.subscribe("joinSingle", (_, obj) => {
            var jid = this.state.joinId
            var name = this.state.joinFilename
            if (!jid.contain(obj.id) && jid.length < 2) {
                jid.push(obj.id)
                name.push(obj.filename)
            }
            // await this.updatePreview()
            this.setState({ joinId: jid, join: name })
            console.log(this.state)
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.unionSingleToken)
        PubSub.unsubscribe(this.jointoken)
    }

    handleUnion = () => {
        this.unionToken = PubSub.publish("union", {
            opMode: 1
        })
        this.preview()
    }

    handleJoin = () => {
        console.log("call handleJoin")
        this.unionToken = PubSub.publish("join", {
            opMode: 2
        })
        axios.get(global.config.url + 'join' + '?queryId=' + this.state.joinId[0] + '&datasetId=' + this.state.joinId[1]
            + '&rows=' + global.config.preRows)
            .then(res => {
                console.log(res.data);
                var joindata = this.state.previewBody
                joindata.push(res.data.joinData)
                var header = this.state.previewHeaders
                header.push(res.data.header)
                this.setState({ previewHeaders: header, previewBody: joindata })
                console.log(this.state)
            })
    }

    handleUnionSearch = () => {
        // debugger;
        axios.post(global.config.url + '/dsquery', { k: global.config.k, dim: 2, querydata: this.state.uniondata, mode: global.config.mode })
            .then(res => {
                //console.log(res)
                PubSub.publish("dsquery2Map", {
                    querynode: {
                        querydata: this.state.uniondata,
                        querytype: this.props.type,
                        queryname: this.props.filename
                    },
                    nodesVo: res.data.nodes,
                    mode: 1
                })
                PubSub.publish("searchhits", { data: res.data.nodes })
            })
    }

    handleEmpty = () => {
        this.setState({ unionId: [], unionFilename: [], uniondata: [], joinId: [], joinFilename: [], previewHeaders: [], previewBody: [] })
        this.emptyToken = PubSub.publish('emptyAug', {
            opMode: 1
        })
    }

    // handleJoin = () => {
    //     axios.get(global.config.url+'?queryid='+this.state.joinId[0]+'&datasetid='+this.state.joinId[1])
    //         .then(res=>{
    //             //console.log(res.data);
    //             var joindata = this.state.previewBody
    //             joindata.push(res.data.joinData)
    //             var header = this.state.previewHeaders
    //             header.push(res.data.header)
    //             this.setState({previewHeaders:header,previewBody:joindata})
    //         })
    // }


    // handleJoin = () => {
    //     axios.get(global.config.url + 'join' + '?queryId=' + this.state.joinId[0] + '&datasetId=' + this.state.joinId[1]
    //         + '&rows=' + global.config.preRows)
    //         .then(res => {
    //             //console.log(res.data);
    //             var joindata = this.state.previewBody
    //             joindata.push(res.data.joinData)
    //             var header = this.state.previewHeaders
    //             header.push(res.data.header)
    //             this.setState({ previewHeaders: header, previewBody: joindata })
    //             console.log(this.state)
    //         })
    // }

    // handleDownloadClicked = () => {
    //     var baseUrl = global.config.url + "file/"
    //     for (var idx in this.state.unionFilename) {
    //         var win = window.open(baseUrl + this.state.unionFilename[idx])
    //     }
    // }

    render() {
        return (
            <div>
                <div className="area2">
                    <div className="union changeline">
                        <p>Union:</p>
                        {
                            this.state.unionId.map((item, idx) => (
                                <span key={item} className="ml-2">{this.state.unionFilename[idx]}</span>
                            ))
                        }
                    </div>
                    <div className="join changeline">
                        <p>Join:</p>
                        {
                            this.state.joinId.map((item, idx) => (
                                <span key={item} className="ml-2">{this.state.joinFilename[idx]}</span>
                            ))
                        }
                    </div>
                </div>
                <div>
                    <p>
                        <button type='button' className='btn radiusBtn sfont' onClick={this.handleUnion}>Union</button>
                        <button type="button" className="btn radiusBtn sfont" onClick={this.handleJoin}>Join</button>
                        <button type="button" className="btn radiusBtn sfont" onClick={this.handleUnionSearch}>UnionSearch</button>
                    {/* </p> */}
                    {/* <p> */}
                        <button type="button" className="btn radiusBtn sfont fr" onClick={this.handleEmpty}>Empty</button>
                        {/* <button type="button" className="btn radiusBtn sfont fr" onClick={this.handleDownloadClicked} >Download</button> */}
                        <button data-tip data-for='preview' data-event='focusin' data-event-off='focusout' place="right" type="button" className="btn radiusBtn sfont fr" >Preview</button>
                    </p>
                    <ReactTooltip id='preview' type="light" place="right" offset={{ right: -170 }} clickable={true} effect="solid" className="maxZ scroll" >
                        {this.list(this.state.previewBody.length)}
                    </ReactTooltip>
                </div>
            </div>
        )
    }
}
