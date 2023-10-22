import {Avatar, Button, List} from 'antd'
import React, {Component} from 'react'
import PubSub from 'pubsub-js'

import SearchDetail from '../SearchDetail/SearchDetail'
import './SearchHits.css'
import '../globalconfig'

export default class SearchResultList extends Component {

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
            isTopk: false,
        }
    }

    componentDidMount() {
        this.token1 = PubSub.subscribe('searchhits', (_, stateObj) => {
            this.setState({
                data: stateObj.data,
                isTopk: stateObj.isTopk,
            })
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token1)
    }

    sortResult(nodes) {
        var oldNodes = nodes.slice(0)
        if (nodes.length > 0) {
            nodes.sort((a, b) => b.node.maxCoverpoints - a.node.maxCoverpoints)
        }
        return oldNodes
    }

    handleSortResult = () => {
        if (!this.state.selSort) {
            this.setState({
                selSort: true,
                oldData: this.sortResult(this.state.data),
            })
        } else {
            this.setState({
                selSort: false,
                data: this.state.oldData,
            })
        }
    }

    // 点击左侧候选列表
    // 分为点击join button, union button和点击空白区域
    // 根据唯一调用该方法处的传参，data就是绑定的组件，e就是组件对应的dataset node item，因此主要用到e而非data
    // 不对，data是item，e是组件元素，e.target包含元素的属性、值、文本内容等信息
    handleClickedDs = (data, e) => {
        this.props.onClickedDsChange(data.datasetID);
        this.setState({
            selid: data.datasetID,
            selFilename: data.fileName,
            selNode: data,
        })
    }

    handleClickAdd = (id,filename,e) => {
        PubSub.publish("addSingle", {
            id: id,
            filename: filename,
        })
    }
    // 哪些情况下会被调用
    // 1. 初始化渲染，返回组件的初始结构和内容
    // 2. 状态（state）或属性（props）变化
    // 3. 父组件更新
    render() {
        return (
            <div>
                <List
                    style={{width: '370px', marginTop: '10px'}}
                    size="small"
                    header={<div>Search Results</div>}
                    bordered
                    dataSource={this.state.data}
                    renderItem={(item, idx) =>
                        <div onClick={this.handleClickedDs.bind(this, item)}
                             className="list-group-item list-group-item-action"
                             idx={idx} key={idx} dsid={item.datasetID}>
                            <Avatar style={{backgroundColor: '#00a2ae', verticalAlign: 'middle'}} size='small'>{idx + 1}</Avatar>
                            <span style={{width: '350px', textOverflow: 'ellipsis'}}>{item.fileName}</span>
                            <Button
                                style={{float: 'right'}}
                                type="default"
                                id={"add" + idx}
                                dsid={item.datasetID}
                                idx={idx}
                                filename={item.fileName}
                                shape="circle"
                                size='small'
                                onClick={this.handleClickAdd.bind(this, idx, item.fileName)}>+
                            </Button>
                        </div>
                    }/>
                <SearchDetail
                    id={this.state.selid}
                    matrix={this.state.selMatrix}
                    filename={this.state.selFilename}
                    type={this.state.selDsType}
                    node={this.state.selNode}
                    rangeQueryMode={this.props.rangeQueryMode}
                    pointQueryMode={this.props.pointQueryMode}
                />
            </div>

        )
    }
}
