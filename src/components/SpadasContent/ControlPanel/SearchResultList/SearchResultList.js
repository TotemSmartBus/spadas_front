import { Avatar, Button, List, message } from 'antd'
import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import global from '../../../global'

import SearchDetail from '../SearchDetail/SearchDetail'
import '../../../global'
import axios from 'axios'

const colors = global.config && global.config.colors ? global.config.colors : ['#00a2ae']
export default class SearchResultList extends Component {

    constructor(props) {
        super(props)
        // 有很多不需要的属性
        this.state = {
            list: [],
            selDsType: 0,
            chooseDataset: null,
            totalPrice: 0
        }
    }

    componentDidMount() {
        this.token1 = PubSub.subscribe('searchhits', (_, obj) => {
            // debugger
            // 有的搜索（如地图上单纯地点击集合标签、data acquisition等）必须得如实返回数据集数量，而不能只显示前10个结果
            // let list = obj.data.length > 10 ? obj.data.slice(0, 10) : obj.data
            let list = obj.data
            console.log(list)
            let totalPrice = 0
            // allocate the color for each dataset
            list.forEach((dataset, i) => {
                dataset.color = colors[i % colors.length]
                totalPrice += dataset.price
            })
            this.setState({
                list: list,
                totalPrice: totalPrice
            })
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token1)
    }

    setDetailDataset = (data, e) => {
        console.log(data)
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

    handleBuy = () => {
        axios.post(global.config.url + 'buy', {
            datasets: this.state.list.map(item => item.datasetID),
            totalPrice: this.state.totalPrice
        }).then(res => {
            console.log(res)
            if (res.data.success === true) {
                message.success('Add to shopping card.')
            } else {
                message.error(`${res.data.errorMsg}`)
            }
        })
    }

    

    render() {
        return (
            <div>
                <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <List
                        style={{
                            width: '370px',
                            marginTop: '10px',
                        }}
                        header={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                height: '20px'
                            }}>
                                <p><strong>Search Results</strong></p>
                                <p>Total Price($): {this.state.totalPrice.toFixed(2)}</p>
                                {this.state.totalPrice > 0 &&
                                    <Button type='default' onClick={this.handleBuy}>Buy All</Button>}
                            </div>

                        }
                        bordered
                        dataSource={this.state.list}
                        renderItem={(item, idx) =>
                            <List.Item onClick={this.setDetailDataset.bind(this, item)}
                                idx={idx} key={idx} dsid={item.datasetID}>
                                <List.Item.Meta
                                    avatar={<Avatar
                                        style={{ backgroundColor: colors[idx % colors.length], verticalAlign: 'middle' }}
                                        size="small">{idx + 1}</Avatar>}
                                    title={item.fileName}
                                    description={`price: ${item.price.toFixed(2)}`} />
                                <Button
                                    style={{ float: 'right' }}
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
                        } />
                </div>

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
