import {DeleteOutlined, EyeOutlined} from '@ant-design/icons'
import {Button, Card, Space, Tag, Tooltip, message} from 'antd'
import React, {Component} from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios'
import ReactTooltip from 'react-tooltip'

import './Augmentarea.css'
import PreviewTable from '../PreviewTable/PreviewTable'

export default class AugmentArea extends Component {
    // unionIds = []
    // unionFilenames = []
    // unionMatrix = []

    state = {
        unionQId: null,
        unionQFilename: null,
        unionDIds: [],
        unionDFilenames: [],
        uniondata: [],
        joinId: [],
        joinFilename: [],
        previewHeaders: [],
        previewBody: [],
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
        isPreview: false,
    }
    list = (length) => {
        var res = [];
        res.push(<PreviewTable header={this.state.previewHeaders[0]} key={0} rows={this.state.previewBody}
                               type={this.state.type}/>)
        return res
    }


    async updatePreview() {
        if (this.state.unionId.length > 0) {
            var that = this
            var dto = {ids: this.state.unionId, rows: global.config.preRows}
            console.log(dto.rows)
            await axios.post(global.config.url + "preview", dto)
                .then(async res => {
                    that.state.previewHeaders = (res.data.headers)
                    that.state.previewBody = (res.data.bodies)
                })
        }
    }

    preview() {
        if (this.state.unionId.length > 0) {
            var dto = {ids: this.state.unionId, rows: global.config.preRows}
            axios.post(global.config.url + "preview", dto)
                .then(res => {
                    this.setState({
                        previewHeaders: res.data.headers,
                        previewBody: res.data.bodies,
                    })
                })
        }
    }

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
            this.setState({list: [...this.state.list, {id: obj.id, filename: obj.filename}]})
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
                preRows: global.config.preRows,
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
            message.error("Fail: Dataset Not Enough.")
        }
    }

    handleURQ = () => {
        if (this.state.augIds.length === 2 && this.state.rangeMax.length > 0) {
            axios.post(global.config.url + 'unionRangeQuery', {
                queryId: this.state.augIds[0],
                rangeMax: this.state.rangeMax,
                rangeMin: this.state.rangeMin,
                unionId: this.state.augIds[1],
                preRows: global.config.preRows,
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
                //console.log(res)
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
        this.setState({
            previewHeaders: [],
            previewBody: [],
            rangeMax: [],
            rangeMin: [],
            type: null,
            list: [],
        })
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
    }

    render() {
        let tags = this.state.list.map((item, idx) => (
            <Tag
                closable
                onClose={this.remove.bind(idx)}
                key={item.id}>
                {item.filename}
            </Tag>))
        return (
            <div>
                <Card
                    title="Operation Area"
                    style={{width: '370px', marginTop: '10px'}}>
                    {tags}
                    <Space style={{marginTop: '10px'}}>
                        <Button type="default" onClick={this.handleUnion}>Union</Button>
                        <Button type="default" onClick={this.handleJoin}>Join</Button>
                        <Tooltip title="Union Range Query">
                            <Button type="default" onClick={this.handleURQ}>URQ</Button>
                        </Tooltip>
                        <Tooltip title="Preview Result">
                            <Button data-for="preview" data-event="focusin" data-event-off="focusout" place="right"
                                    type="primary" icon={<EyeOutlined/>}></Button>
                        </Tooltip>
                        <Tooltip title="Empty Area">
                            <Button type="default" danger onClick={this.handleEmpty} icon={<DeleteOutlined/>}></Button>
                        </Tooltip>
                        <ReactTooltip id="preview" type="light" place="right" clickable={true} effect="solid"
                                      className="maxZ scroll">
                            <PreviewTable header={this.state.previewHeaders} key={0} rows={this.state.previewBody}
                                          type={this.state.type}></PreviewTable>
                        </ReactTooltip>
                    </Space>
                </Card>

            </div>
        )
    }
}
