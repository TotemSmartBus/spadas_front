import {DownloadOutlined, EyeOutlined, SearchOutlined} from '@ant-design/icons'
import {Button, Card, Descriptions, message, Space, Tooltip} from 'antd'
import axios from 'axios'
import Pubsub from 'pubsub-js'
import React from 'react'
import '../../../../global'

const PureSpatialTableHeaders = [{
    title: 'Longitude',
    dataIndex: 'lng',
    key: 'lng',
}, {
    title: 'Latitude',
    dataIndex: 'lat',
    key: 'lat',
}]

const SearchDetail = (props) => {
    const {id, filename, node} = props

    function handleSearchRelatedClicked() {
        axios.post(global.config.url + 'dsquery', {
            k: global.config.k,
            dim: 2,
            mode: props.pointQueryMode,
            datasetId: props.id,
        }).then(res => {
            Pubsub.publish("dsquery2Map", {
                querynode: {
                    querydata: props.matrix,
                    querytype: props.type,
                    queryname: props.filename,
                },
                nodesVo: res.data.nodes,
                mode: 1,
                opMode: 0,
                dsQueryNode: props.node,
            })
            let pure_nodes = res.data.nodes.map(item => item.node)
            Pubsub.publish('searchhits', {
                data: pure_nodes,
                isTopk: true,
            })
            message.success("Search Related Datasets Success.");
        })
    }

    function handleQueryRelatedRoadClicked() {
        props.searchRelatedRoad(props.id)
    }

    function handleDownloadClicked() {
        var url = global.config.url + "file/" + props.id
        window.open(url)
    }

    function handlePreview() {
        props.setPreviewOpen(true)
        axios.get(global.config.url + 'getds', {params: {id: props.id}})
            .then(res => {
                if (res.status !== 200) {
                    message.error('error send request')
                    console.error(res)
                    return
                }
                let columns = res.data.node.matrix.map(e => {
                    return {lng: e[0], lat: e[1]}
                })
                debugger
                props.setPreviewData({
                    headers: PureSpatialTableHeaders,
                    data: columns,
                    title: 'Preview for Dataset ' + props.id,
                })
            }).catch(e => {
            message.error('error send request' + e)
            console.error(e)
        })
    }

    const items = props.node ? [
        {
            key: 'datasetName',
            label: 'Dataset Name',
            children: filename,
        }, {
            key: 'datasetID',
            label: 'Dataset ID',
            children: id,
        }, {
            key: 'pivot',
            label: 'Pivot',
            children: node.pivot[0].toFixed(4) + ',' + node.pivot[1].toFixed(4),
        }, {
            key: 'radius',
            label: 'Radius',
            children: node.radius.toFixed(4),
        }, {
            key: 'coveredPoints',
            label: 'Covered Points',
            children: node.totalCoveredPoints,
        },
    ] : []
    return node ? [
        <Card size="small" title="Dataset Details" bordered={true} style={{width: '370px', marginTop: '10px'}}>
            <Descriptions
                size="small"
                bordered
                style={{width: '350px'}}
                column={1}
                items={items}/>
            <Space style={{marginTop: '10px'}}>
                <Tooltip title={'Preview Result'}>
                    <Button data-for="preview" onClick={handlePreview} place="right"
                            type="primary"
                            icon={<EyeOutlined/>}
                    ></Button>
                </Tooltip>
                <Button type="primary" size="small" shape="round"
                        onClick={handleSearchRelatedClicked}><SearchOutlined/>Related Datasets</Button>
                <Button type="primary" size="small" shape="round"
                        onClick={handleQueryRelatedRoadClicked}><SearchOutlined/>Related Roads</Button>
                <Button type="default" size="small" shape="round"
                        onClick={handleDownloadClicked}><DownloadOutlined/></Button>
            </Space>
        </Card>] : null
}

export default SearchDetail