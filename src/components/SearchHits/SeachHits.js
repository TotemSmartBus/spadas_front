import React, { Component } from 'react'
import PubSub from 'pubsub-js'

import SearchDetail from '../SearchDetail/SearchDetail'
import './SearchHits.css'
import '../globalconfig'

export default class SeachHits extends Component {

    constructor(props) {
        super(props)
        // 有很多不需要的属性
        this.state = {
            data: [],
            selid: null,
            selMatrix: [],
            selFilename: "",
            selDsType: 0,
            selNode: null,
            selSort: false,
            oldData: [],
            isTopk: false
        }
    }
    componentDidMount() {
        this.token1 = PubSub.subscribe('searchhits', (_, stateObj) => {
            console.log(stateObj)
            this.setState({
                data: stateObj.data,
                isTopk: stateObj.isTopk
            })
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

    // 点击左侧候选列表
    // 分为点击join button, union button和点击空白区域
    // 根据唯一调用该方法处的传参，data就是绑定的组件，e就是组件对应的dataset node item，因此主要用到e而非data
    // 不对，data是item，e是组件元素，e.target包含元素的属性、值、文本内容等信息
    handleClickedDs = (data, e) => {
        /**
         *  div与btn的点击事件分离
         */
        console.log(data)
        console.log(e.target)
        // 尝试只使用selNode这个state，不用其他的
        this.setState({ selNode: e.target })

        console.log(data.datasetID)
        var idx = e.target.getAttribute("idx")
        console.log(idx)
        var dsid = e.target.getAttribute("dsid")
        console.log(dsid)
        // 定位到点击的地方
        let union = document.querySelector("#union" + idx)
        let join = document.querySelector("#join" + idx)
        if (union || join) {
            console.log(union)
            console.log(join)

            // 点击union或join button，e就是该元素
            if (union.contains(e.target)) {
                // div union btn点击事件
                // union不能传这么多数据
                PubSub.publish("unionSingle", {
                    id: e.target.getAttribute("dsid"),
                    // filename: e.target.getAttribute("filename"),
                    // matrix: this.state.data[e.target.getAttribute('idx')].matrix,
                    // node: data
                    // id: data.datasetID,
                    filename: e.target.getAttribute("filename")
                })
                // console.log(e.target.getAttribute('dsid'))
                // console.log(e.target.getAttribute('filename'))
                // console.log(data.datasetID)
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
                    // filename: e.target.getAttribute("filename"),
                    // matrix: this.state.data[e.target.getAttribute('idx')].matrix,
                    // node: data
                    // id: data.datasetID,
                    filename: e.target.getAttribute("filename")
                })
            }
            //div(除btn)点击事件
            // console.log(e.target);
            // console.log("shift!")
            console.log("click on one dataset!")
            console.log(data.datasetID)
            // 下面这句很关键
            // 子组件调用父组件的方法？
            // 这行代码的作用是什么
            // handleClickedDsChange是父组件index的方法
            this.props.onClickedDsChange(data.datasetID)

            // 发布union range query事件
            // if (this.state.isTopk === true) {
            //     PubSub.publish('urq', {
            //         isQ: false,
            //         id: data.datasetID,
            //         name: data.fileName
            //     })
            //     PubSub.publish('isURQ', {
            //         isURQ: true
            //     })
            // }

            // this.props.onClickedDsChange(e.target.getAttribute('dsid'))
            // this.setState({ selid: e.target.getAttribute('dsid'), selMatrix: this.state.data[e.target.getAttribute('idx')].matrix, selFilename: this.state.data[e.target.getAttribute('idx')].filename, selDsType: this.state.data[e.target.getAttribute('idx')].node.type })
            // 如果不修改这些属性会怎么样
            this.setState({
                selid: data.datasetID,
                // selid: e.target.getAttribute('dsid'),
                // selMatrix: this.state.data[e.target.getAttribute('idx')].matrix,
                selFilename: data.fileName,
                // selFilename: this.state.data[e.target.getAttribute('idx')].filename,
                // selDsType: this.state.data[e.target.getAttribute('idx')].node.type,
                // selNode: this.state.data[e.target.getAttribute('idx')].node
                selNode: data
            })
            // console.log(this.state.selFilename)

        }

        let add = document.querySelector("#add" + idx);
        if (add) {
            console.log(add);
            if (add.contains(e.target)) {
                PubSub.publish("addSingle", {
                    id: e.target.getAttribute("dsid"),
                    filename: e.target.getAttribute("filename")
                })
            }
            console.log("click on one dataset.");
            this.props.onClickedDsChange(data.datasetID);
            this.setState({
                selid: data.datasetID,
                selFilename: data.fileName,
                selNode: data
            });
        }

        // else {
        //     //div(除btn)点击事件

        //     console.log(e.target)
        //     //console.log(this.state.data[e.target.getAttribute('idx')].node.type);
        //     this.setState({
        //         selid: e.target.getAttribute('dsid'),
        //         // selMatrix: this.state.data[e.target.getAttribute('idx')].matrix,
        //         // selFilename: this.state.data[e.target.getAttribute('idx')].filename,
        //         selFilename: data.fileName,
        //         // selDsType: this.state.data[e.target.getAttribute('idx')].node.type,
        //         // selNode: this.state.data[e.target.getAttribute('idx')]
        //         selNode: data
        //     })
        //     console.log(this.state.selNode)
        //     this.props.onClickedDsChange(e.target.getAttribute('dsid'))
        // }
    }

    // 哪些情况下会被调用
    // 1. 初始化渲染，返回组件的初始结构和内容
    // 2. 状态（state）或属性（props）变化
    // 3. 父组件更新
    render() {
        console.log(this.state.data[0]);
        return (
            <div>
                {/* <div class="radio">
                    <label><input type="radio" name="optradio" onChange={this.handleSortResult} />Option 1</label>
                </div> */}
                <div className="card row pre-scrollable hitbox" style={{ display: "block", marginTop: "2rem" }}>
                    <div className="card-header">
                        SearchHits
                        <label class="form-check-label rt" style={{ display: 'none' }}>
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
                                // 将state.data列举到table上
                                // 这里的idx跟datasetID没有关系
                                this.state.data.map((item, idx) => (
                                    // 将该组件和item对象都绑定到handleClickedDs方法上，点击该组件时调用该方法
                                    <div onClick={this.handleClickedDs.bind(this, item)} className="list-group-item list-group-item-action" font-aria-setsize={8} idx={idx} key={idx} dsid={item.datasetID}>&lt;{idx + 1}&gt; {item.fileName}
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
                                        {/* 感觉这些属性很有问题 */}
                                        {/* 为啥非要设置这么多冗余的属性 */}
                                        <p>
                                            {/* <button id={"union" + idx} dsid={item.datasetID} idx={idx} filename={item.fileName} className="badge badge-primary badge-pill augbtn">Union</button>
                                            <button id={"join" + idx} dsid={item.datasetID} idx={idx} filename={item.fileName} className="badge badge-primary badge-pill augbtn mr-2">Join</button> */}
                                            <button id={"add" + idx} dsid={item.datasetID} idx={idx} filename={item.fileName} className="badge badge-primary badge-pill augbtn">AddToAug</button>
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
