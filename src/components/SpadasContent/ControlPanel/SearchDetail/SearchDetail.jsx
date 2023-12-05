import {DownloadOutlined, EyeOutlined, SearchOutlined} from '@ant-design/icons'
import {Button, Card, Descriptions, message, Space, Tooltip} from 'antd'
import axios from 'axios'
import Pubsub from 'pubsub-js'
import React from 'react'
import '../../../global'

import {previewMode} from '../previewHelper'

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
    const dataset = props.dataset

    function handleSearchRelatedClicked() {
        axios.post(global.config.url + 'dsquery', {
            k: props.parameters.topK,
            dim: 2,
            mode: props.parameters.pointQueryMode,
            datasetId: dataset.datasetID,
        }).then(res => {
            let pure_nodes = res.data.nodes.map(item => item.node)
            Pubsub.publish('searchhits', {
                data: pure_nodes,
            })
            message.success("Search Related Datasets Success.");
        })
    }

    function handleQueryRelatedRoadClicked() {
        props.searchRelatedRoad(dataset.datasetID)
    }

    function handleDownloadClicked() {
        var url = global.config.url + "file/" + dataset.datasetID
        window.open(url)
    }

    function handlePreview() {
        props.setPreviewOpen(true)
        axios.get(global.config.url + 'getds', {params: {id: dataset.datasetID}})
            .then(res => {
                if (res.status !== 200) {
                    message.error('error send request')
                    console.error(res)
                    return
                }
                let columns = res.data.node.matrix.map(e => {
                    return {lng: e[0], lat: e[1]}
                })
                props.setMode(previewMode.view)
                props.setPreviewData({
                    headers: PureSpatialTableHeaders,
                    data: columns,
                    title: 'Preview for Dataset ' + dataset.datasetID,
                })
            }).catch(e => {
            message.error('error send request' + e)
            console.error(e)
        })
    }

    const items = dataset ? [
        {
            key: 'datasetName',
            label: 'Dataset Name',
            children: dataset.fileName,
        }, {
            key: 'datasetID',
            label: 'Dataset ID',
            children: dataset.datasetID,
        }, {
            key: 'pivot',
            label: 'Pivot',
            children: dataset.pivot[0].toFixed(4) + ',' + dataset.pivot[1].toFixed(4),
        }, {
            key: 'radius',
            label: 'Radius',
            children: dataset.radius.toFixed(4),
        }, {
            key: 'coveredPoints',
            label: 'Covered Points',
            children: dataset.totalCoveredPoints,
        },
    ] : []
    return dataset ? [
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