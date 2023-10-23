import {DownloadOutlined, SearchOutlined} from '@ant-design/icons'
import {Button, Card, Descriptions, message, Space} from 'antd'
import axios from 'axios'
import Pubsub from 'pubsub-js'
import React from 'react'
import '../../../../globalconfig'

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

    function handleDownloadClicked() {
        var url = global.config.url + "file/" + props.id
        window.open(url)
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
                items={items}/>,
            <Space style={{marginTop:'10px'}}>
                <Button type="primary" size="small" shape="round"
                        onClick={handleSearchRelatedClicked}><SearchOutlined/>Search Related</Button>
                <Button type="primary" size="small" shape="round"
                        onClick={handleDownloadClicked}><DownloadOutlined/>Download</Button>
            </Space>
        </Card>] : null
}

export default SearchDetail