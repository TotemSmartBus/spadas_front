import {DeleteOutlined} from '@ant-design/icons'
import {Button, Card, Space, Tag, Tooltip, message} from 'antd'
import React, {Component} from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios'
import '../../../global'

const emptyState = {
    urqQId: null,
    urqQFilename: null,
    urqDId: null,
    urqDFilename: null,
    rangeMin: [],
    rangeMax: [],
    type: null,
    list: [],
    preview: {
        open: false,
        data: [],
    },
}

export default class AugmentArea extends Component {
    state = emptyState

    componentDidMount() {

        this.addSingleToken = PubSub.subscribe("addSingle", (_, obj) => {
            let newList = [...this.state.list, obj]
            this.setState({list: newList})
            this.props.setDatasets(newList)
        })

        this.rangeToken = PubSub.subscribe('getRange', (_, obj) => {
            this.setState({
                rangeMax: obj.rangeMax,
                rangeMin: obj.rangeMin,
            });
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.emptyToken)
        PubSub.unsubscribe(this.unionSingleToken)
        PubSub.unsubscribe(this.rangeToken)
    }

    handleJoin = () => {
        if (this.state.list.length === 2) {
            this.props.joinSearch(this.state.list[0], this.state.list[1])
        } else {
            message.error("Only support 2 datasets join.")
        }
    }

    handleUnion = () => {
        if (this.state.list.length === 2) {
            this.props.unionSearch(this.state.list[0], this.state.list[1])
        } else {
            message.error("Only support 2 datasets union.")
        }
    }

    handleURQ = () => {
        if (this.state.list.length === 2 && this.state.rangeMax.length > 0) {
            axios.post(global.config.url + 'unionRangeQuery', {
                queryId: this.state.list[0],
                rangeMax: this.state.rangeMax,
                rangeMin: this.state.rangeMin,
                unionId: this.state.list[1],
                preRows: global.config.previewLimit,
            }).then(res => {
                this.setState({
                    previewHeaders: res.data.headers,
                    previewBody: res.data.bodies,
                    type: res.data.type,
                })
                message.success('Union Range Query Success.');
            })
        } else if (this.state.list.length < 2) {
            message.error("Fail: Dataset Not Enough.");
        } else {
            message.error("Notice: Draw a Range First.");
        }

    }

    remove = (idx) => {
        let newList = this.state.list
        for (let i = 0; i < newList.length; i++) {
            if (newList[i].id === idx) {
                newList.splice(i, 1)
            }
        }
        this.setState({list: newList})
        this.props.setDatasets(newList)
    }

    render() {
        let tags = this.state.list.map((item, idx) => (
            <Tag
                closable
                onClose={this.remove.bind(idx)}
                key={item.id}>
                {item.fileName}
            </Tag>))
        let isEmptyList = this.state.list.length === 0
        return (
            <div>
                <Card
                    title="Operation Area"
                    style={{width: '370px', marginTop: '10px'}}>
                    {tags}
                    <Space style={{marginTop: '10px'}}>
                        <Tooltip title={isEmptyList ? 'Select datasets first!' : 'Union Query'}>
                            <Button type="default" onClick={this.handleUnion} disabled={isEmptyList}>Union</Button>
                        </Tooltip>
                        <Tooltip title={isEmptyList ? 'Select datasets first!' : 'Join Query'}>
                            <Button type="default" onClick={this.handleJoin} disabled={isEmptyList}>Join</Button>
                        </Tooltip>
                        <Tooltip title={isEmptyList ? 'Select datasets first!' : 'Union Range Query'}>
                            <Button type="default" onClick={this.handleURQ} disabled={isEmptyList}>URQ</Button>
                        </Tooltip>
                        <Tooltip title="Empty Area">
                            <Button type="default" danger disabled={isEmptyList} onClick={this.handleEmpty}
                                    icon={<DeleteOutlined/>}></Button>
                        </Tooltip>
                    </Space>
                </Card>
            </div>
        )
    }
}
