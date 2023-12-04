import {Avatar, Button, List, message} from 'antd'
import React, {Component} from 'react'
import PubSub from 'pubsub-js'
import global from '../../../global'

import SearchDetail from './SearchDetail/SearchDetail'
import '../../../global'


const colors = global.config && global.config.colors ? global.config.colors : ['#00a2ae']
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
            let list = stateObj.data.length > 10 ? stateObj.data.slice(0, 10) : stateObj.data
            // allocate the color for each dataset
            list.forEach((dataset, i) => {
                dataset.color = colors[i % colors.length]
            })
            this.setState({
                data: list,
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
    setDataset = (data, e) => {
        this.props.setDatasets([data])
        this.setState({
            selid: data.datasetID,
            selFilename: data.fileName,
            selNode: data,
        })
    }

    handleClickAdd = (item, e) => {
        // 将数据集添加到聚合的地方
        PubSub.publish("addSingle", item)
        message.success('Add success')
        e.preventDefault()
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
                    header={<div>Search Results</div>}
                    bordered
                    dataSource={this.state.data}
                    renderItem={(item, idx) =>
                        <List.Item onClick={this.setDataset.bind(this, item)}
                                   idx={idx} key={idx} dsid={item.datasetID}>
                            <List.Item.Meta
                                avatar={<Avatar
                                    style={{backgroundColor: colors[idx % colors.length], verticalAlign: 'middle'}}
                                    size="small">{idx + 1}</Avatar>}
                                title={item.fileName}/>
                            <Button
                                style={{float: 'right'}}
                                type="default"
                                id={"add" + idx}
                                dsid={item.datasetID}
                                idx={idx}
                                filename={item.fileName}
                                shape="circle"
                                size="small"
                                onClick={this.handleClickAdd.bind(this, item)}>+
                            </Button>
                        </List.Item>
                    }/>
                <SearchDetail
                    id={this.state.selid}
                    matrix={this.state.selMatrix}
                    filename={this.state.selFilename}
                    type={this.state.selDsType}
                    node={this.state.selNode}
                    rangeQueryMode={this.props.rangeQueryMode}
                    pointQueryMode={this.props.pointQueryMode}
                    setPreviewOpen={this.props.setPreviewOpen}
                    setPreviewData={this.props.setPreviewData}
                    searchRelatedRoad={this.props.searchRelatedRoad}
                    setMode={this.props.setMode}
                />
            </div>
        )
    }
}
