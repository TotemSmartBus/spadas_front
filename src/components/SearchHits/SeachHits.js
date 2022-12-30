import React, { Component } from 'react'
import PubSub from 'pubsub-js'

import SearchDetail from '../SearchDetail/SearchDetail'
import './SearchHits.css'
import '../globalconfig'

export default class SeachHits extends Component {

    constructor(props) {
        super(props)
        this.state = { data: [], selid: null, selMatrix: [], selFilename: "", selDsType: 0, selNode: null, selSort: false, oldData: [] }
    }
    componentDidMount() {
        this.token1 = PubSub.subscribe('searchhits', (_, stateObj) => {
            console.log(stateObj)
            this.setState(stateObj)
            // this.setState({
            //     data: stateObj
            // })
            console.log(this.state)
        })

        this.token2 = PubSub.subscribe('mapClickNode', (_, node) => {
            console.log(node);
            var list = []
            list.push(node)
            this.setState({ data: list })
        })

        console.log(this.state)

    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.token1)
    }

    sortResult(nodes) {
        var oldNodes = nodes.slice(0)
        if (nodes.length > 0) {
            nodes.sort((a, b) => b.node.maxCoverpoints - a.node.maxCoverpoints)
        }
        console.log(oldNodes)
        return oldNodes
    }

    handleSortResult = () => {
        if (this.state.selSort == false) {
            this.setState({
                selSort: true,
                oldData: this.sortResult(this.state.data)
            })
            // this.state.oldData = this.sortResult(this.state.data)
            console.log(this.state)
        } else {
            this.setState({
                selSort: false,
                data: this.state.oldData
            })
            console.log(this.state)
        }
    }

    handleClickedDs = (data, e) => {
        /**
         *  div与btn的点击事件分离
         */
        console.log(data)
        this.setState({ selNode: e.target })

        console.log(data.datasetID)
        var idx = e.target.getAttribute("idx")
        console.log(idx)
        var dsid = e.target.getAttribute("dsid")
        console.log(dsid)
        let union = document.querySelector("#union" + idx)
        let join = document.querySelector("#join" + idx)
        if (union || join) {
            console.log(union)
            console.log(join)

            if (union.contains(e.target)) {
                // div union btn点击事件
                PubSub.publish("unionSingle", {
                    id: e.target.getAttribute("dsid"),
                    filename: e.target.getAttribute("filename"),
                    matrix: this.state.data[e.target.getAttribute('idx')].matrix,
                    node: data
                })
            }
            // else{
            //     //div(除btn)点击事件
            //     this.props.onClickedDsChange(e.target.getAttribute('dsid'))
            //     this.setState({selid:e.target.getAttribute('dsid'),selMatrix:this.state.data[e.target.getAttribute('idx')].matrix,selFilename:this.state.data[e.target.getAttribute('idx')].filename,selDsType:0})
            // }  


            //div join btn 点击事件
            if (join.contains(e.target)) {
                console.log("call joinSingle")
                PubSub.publish("joinSingle", {
                    id: e.target.getAttribute("dsid"),
                    filename: e.target.getAttribute("filename"),
                    matrix: this.state.data[e.target.getAttribute('idx')].matrix,
                    node: data
                })
            }
            //div(除btn)点击事件
            // console.log(e.target);
            // console.log("shift!")
            console.log("click on one dataset!")
            // 下面这句很关键
            // 子组件调用父组件的方法？
            this.props.onClickedDsChange(e.target.getAttribute('dsid'))
            // this.setState({ selid: e.target.getAttribute('dsid'), selMatrix: this.state.data[e.target.getAttribute('idx')].matrix, selFilename: this.state.data[e.target.getAttribute('idx')].filename, selDsType: this.state.data[e.target.getAttribute('idx')].node.type })
            this.setState({
                selid: e.target.getAttribute('dsid'),
                selMatrix: this.state.data[e.target.getAttribute('idx')].matrix,
                selFilename: this.state.data[e.target.getAttribute('idx')].filename,
                selDsType: this.state.data[e.target.getAttribute('idx')].node.type,
                selNode: this.state.data[e.target.getAttribute('idx')].node
            })


        }
        // else {
        //     //div(除btn)点击事件

        //     console.log(e.target)
        //     //console.log(this.state.data[e.target.getAttribute('idx')].node.type);
        //     this.setState({
        //         selid: e.target.getAttribute('dsid'),
        //         selMatrix: this.state.data[e.target.getAttribute('idx')].matrix,
        //         selFilename: this.state.data[e.target.getAttribute('idx')].filename,
        //         selDsType: this.state.data[e.target.getAttribute('idx')].node.type,
        //         selNode: this.state.data[e.target.getAttribute('idx')]
        //     })
        //     console.log(this.state.selNode)
        //     this.props.onClickedDsChange(e.target.getAttribute('dsid'))
        // }
    }

    render() {
        console.log(this.state.data);
        return (
            <div>
                {/* <div class="radio">
                    <label><input type="radio" name="optradio" onChange={this.handleSortResult} />Option 1</label>
                </div> */}
                <div className="card row pre-scrollable hitbox" style={{ display: "block", marginTop: "2rem" }}>
                    <div className="card-header">
                        SearchHits
                        <label class="form-check-label rt">
                            <input type="checkbox" class="form-check-input" value="" onChange={this.handleSortResult} />SortByPoints
                        </label>
                    </div>
                    <div role="tabpanel">
                        <div className="list-group" id="myList" role="tablist">
                            {
                                // this.state.data.map((item,idx)=>(
                                // (
                                //     idx===0? 
                                //     <a className="list-group-item list-group-item-action active" onClick={this.handleClickedDs} idx={idx} key={idx} data-toggle="list" href={item.datasetID}  role="tab" dsid={item.datasetID}>{item.datasetID+".csv"}
                                //     <span className="badge badge-primary badge-pill augbtn">2</span></a> :
                                //     <a className="list-group-item list-group-item-action" onClick={this.handleClickedDs} idx={idx} key={idx} data-toggle="list" href={item.datasetID}  role="tab" dsid={item.datasetID}>{item.datasetID+".csv"}</a>
                                // )))

                                this.state.data.map((item, idx) => (
                                    <div onClick={this.handleClickedDs.bind(this, item.node)} className="list-group-item list-group-item-action" font-aria-setsize={8} idx={idx} key={idx} dsid={item.node.datasetID}>{item.filename}
                                        {/* {
                                    item.node.type===0? */}
                                        {/* <ul className='list-group'>
                                        <li className='list-group-item'>Pivot: [{item.node.pivot[0].toFixed(4)}, {item.node.pivot[1].toFixed(4)}]</li>
                                        <li className='list-group-item'>Radius: {item.node.radius.toFixed(4)}</li>
                                    </ul> */}
                                        {/* <h6>{item.filename}</h6>
                                    <p>
                                        Pivot: [{item.node.pivot[0].toFixed(4)}, {item.node.pivot[1].toFixed(4)}]<br/>
                                        Radius: {item.node.radius.toFixed(4)}<br/>
                                        CoveredPoints: {item.node.totalCoveredPoints}
                                    </p> */}
                                        {/* <p>Radius: {item.node.radius.toFixed(4)}</p> */}
                                        <p>
                                            <button id={"union" + idx} dsid={item.node.datasetID} idx={idx} filename={item.filename} className="badge badge-primary badge-pill augbtn">Union</button>
                                            <button id={"join" + idx} dsid={item.node.datasetID} idx={idx} filename={item.filename} className="badge badge-primary badge-pill augbtn mr-2">Join</button>
                                        </p>
                                        {/* } */}
                                    </div>
                                ))

                            }
                        </div>
                    </div>

                </div>
                <SearchDetail id={this.state.selid} matrix={this.state.selMatrix} filename={this.state.selFilename} type={this.state.selDsType} node={this.state.selNode} />
            </div>

        )
    }
}
