import {Avatar, Button, List, message} from 'antd'
import React, {Component} from 'react'
import PubSub from 'pubsub-js'
import global from '../../../global'

import SearchDetail from '../SearchDetail/SearchDetail'
import '../../../global'


const colors = global.config && global.config.colors ? global.config.colors : ['#00a2ae']
export default class SearchResultList extends Component {

    constructor(props) {
        super(props)
        // 有很多不需要的属性
        this.state = {
            list: [],
            selDsType: 0,
            chooseDataset: null,
        }
    }

    componentDidMount() {
        this.token1 = PubSub.subscribe('searchhits', (_, obj) => {
            // debugger
            let list = obj.data.length > 10 ? obj.data.slice(0, 10) : obj.data
            // allocate the color for each dataset
            list.forEach((dataset, i) => {
                dataset.color = colors[i % colors.length]
            })
            this.setState({
                list: list,
            })
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token1)
    }

    setDetailDataset = (data, e) => {
        // view data points on map
        this.props.setDatasets([data])
        // view details in SearchDetail
        this.setState({
            chooseDataset: data,
        })
    }

    handleClickAdd = (item, e) => {
        // 将数据集添加到聚合的地方
        PubSub.publish("addSingle", item)
        message.success('Add success')
        e.preventDefault()
    }

    render() {
        return (
            <div>
                <List
                    style={{width: '370px', marginTop: '10px'}}
                    header={<div>Search Results</div>}
                    bordered
                    dataSource={this.state.list}
                    renderItem={(item, idx) =>
                        <List.Item onClick={this.setDetailDataset.bind(this, item)}
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
                    dataset={this.state.chooseDataset}
                    setPreviewOpen={this.props.setPreviewOpen}
                    setPreviewData={this.props.setPreviewData}
                    searchRelatedRoad={this.props.searchRelatedRoad}
                    setMode={this.props.setMode}
                    parameters={this.props.parameters}
                />
            </div>
        )
    }
}
