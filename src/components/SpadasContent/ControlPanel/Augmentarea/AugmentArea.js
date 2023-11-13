import {DeleteOutlined, EyeOutlined} from '@ant-design/icons'
import {Button, Card, Space, Tag, Tooltip, message} from 'antd'
import React, {Component} from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios'
import '../../../global'

const emptyState = {
    unionQId: null,
    unionQFilename: null,
    unionDIds: [],
    unionDFilenames: [],
    uniondata: [],
    joinId: [],
    joinFilename: [],
    urqQId: null,
    urqQFilename: null,
    urqDId: null,
    urqDFilename: null,
    rangeMin: [],
    rangeMax: [],
    type: null,

    augIds: [],
    augFilenames: [],

    list: [],
    preview: {
        open: false,
        data: [],
    },
}

export default class AugmentArea extends Component {
    state = emptyState

    componentDidMount() {
        this.unionSingleToken = PubSub.subscribe("unionSingle", (_, obj) => {
            if (this.state.unionQId === null) {
                this.setState({
                    unionQId: obj.id,
                    unionQFilename: obj.filename,
                })
            } else {
                this.setState(prevState => ({
                    unionDIds: [...prevState.unionDIds, obj.id],
                    unionDFilenames: [...prevState.unionDFilenames, obj.filename],
                }))
            }
        })

        this.addSingleToken = PubSub.subscribe("addSingle", (_, obj) => {
            let newList = [...this.state.list, obj]
            this.setState({list: newList})
            this.props.onClickedDsChange(newList)
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

    handleUnion = () => {
        if (this.state.list.length === 2) {
            this.unionToken = PubSub.publish("union", {
                opMode: 1,
            })
            axios.post(global.config.url + 'union', {
                queryId: this.state.list[0].id,
                unionIds: this.state.list[1].id,
                preRows: global.config.defaultPreviewLimit,
            }).then(res => {
                this.setState({
                    previewHeaders: res.data.headers,
                    previewBody: res.data.bodies,
                    type: res.data.type,
                })
                message.success("Union Success.")
            })
        } else {
            message.error("Fail: Dataset Not Enough.")
        }

        // this.preview()
    }

    handleJoin = () => {
        if (this.state.augIds.length === 2) {
            this.joinToken = PubSub.publish("join", {
                opMode: 2,
            });
            axios.get(global.config.url + 'join?queryId=' + this.state.augIds[0] + '&datasetId=' + this.state.augIds[1]
                + '&rows=' + global.config.preRows)
                .then(res => {
                    var joindata = []
                    joindata.push(res.data.joinData)
                    this.setState({
                        previewHeaders: res.data.header,
                        previewBody: joindata,
                        type: "join",
                    })
                    message.success('Join Success.')
                })
        } else {
            message.error("Dataset Not Enough.")
        }
    }

    handleURQ = () => {
        if (this.state.augIds.length === 2 && this.state.rangeMax.length > 0) {
            axios.post(global.config.url + 'unionRangeQuery', {
                queryId: this.state.augIds[0],
                rangeMax: this.state.rangeMax,
                rangeMin: this.state.rangeMin,
                unionId: this.state.augIds[1],
                preRows: global.config.defaultPreviewLimit,
            }).then(res => {
                this.setState({
                    previewHeaders: res.data.headers,
                    previewBody: res.data.bodies,
                    type: res.data.type,
                })
                message.success('Union Range Query Success.');
            })
        } else if (this.state.augIds.length < 2) {
            message.error("Fail: Dataset Not Enough.");
        } else {
            message.error("Notice: Draw a Range First.");
        }

    }

    handleUnionSearch = () => {
        axios.post(global.config.url + '/dsquery', {
            k: global.config.k,
            dim: 2,
            querydata: this.state.uniondata,
            mode: global.config.mode,
        })
            .then(res => {
                PubSub.publish("dsquery2Map", {
                    querynode: {
                        querydata: this.state.uniondata,
                        querytype: this.props.type,
                        queryname: this.props.filename,
                    },
                    nodesVo: res.data.nodes,
                    mode: 1,
                })
                PubSub.publish('searchhits', {data: res.data.nodes})
            })
    }

    handleEmpty = () => {
        this.setState(emptyState)
        this.emptyToken = PubSub.publish('emptyAug', {
            opMode: 1,
        })
    }

    remove = (idx) => {
        let newList = this.state.list
        for (let i = 0; i < newList.length; i++) {
            if (newList[i].id === idx) {
                newList.splice(i, 1)
            }
        }
        this.setState({list: newList})
        this.props.onClickedDsChange(newList)
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
