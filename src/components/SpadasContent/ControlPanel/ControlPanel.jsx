import {Flex, message} from 'antd'
import axios from 'axios'
import React, {useState} from 'react'

import AugmentArea from './Augmentarea/AugmentArea'
import PreviewDrawer from './Augmentarea/PreviewDrawer/PreviewDrawer'
import KeywordsSearch from './KeywordsSearch/KeywordsSearch'
import OptionPanel from './OptionPanel/OptionPanel'
import {FindRoadTableHeaders, JoinTableHeaders, previewMode, UnionTableHeaders} from './previewHelper'
import SearchResultList from './SearchResultList/SearchResultList'

const ControlPanel = (props) => {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewData, setPreviewData] = useState({headers: [], data: []})
    const [mode, setMode] = useState(previewMode.view)

    function closePreview() {
        setPreviewData(null)
        setPreviewOpen(false)
        props.setHighlight({
            points: [],
            roads: [],
        })
    }

    function searchRelatedRoad(id) {
        setPreviewOpen(true)
        axios.post(global.config.url + 'findRoad?id=' + id)
            .then(res => {
                if (res.status !== 200) {
                    message.warning('Server return code' + res.status)
                    return
                }
                let data = res.data
                setMode(previewMode.road)
                setPreviewData({headers: FindRoadTableHeaders, data: data, title: 'Related Road for Dataset ' + id})
            }).catch(err => {
            console.error(err)
            message.warning("Search failed.")
        })
    }

    function joinSearch(dataset1, dataset2) {
        setPreviewOpen(true)
        axios.get(global.config.url + 'join?queryId=' + dataset1.datasetID + '&datasetId=' + dataset2.datasetID + '&rows=' + global.config.defaultPreviewLimit)
            .then(res => {
                let title = "Join Result for " + res.data.queryDatasetID + ' and ' + res.data.targetDatasetID
                setMode(previewMode.join)
                setPreviewData({headers: JoinTableHeaders, data: res.data.list, title: title})
                message.success('Join Success.')
                dataset1.color = '#1677ff'
                dataset2.color = '#EC360F'
                props.setDatasets([dataset1, dataset2])
            }).catch((e) => {
            console.log(e)
            message.error('Failed to join search.')
        })
    }

    function unionSearch(dataset1, dataset2) {
        setPreviewOpen(true)
        axios.post(global.config.url + 'union', {
            queryId: dataset1.datasetID,
            unionId: dataset2.datasetID,
            preRows: global.config.defaultPreviewLimit,
        }).then(res => {
            let title = "Union Result for " + dataset1.datasetID + ' and ' + dataset2.datasetID
            let queryData = res.data.bodies[0].map((value, index) => {
                return {
                    id: index,
                    isQuery: true,
                    lng: value[0],
                    lat: value[1],
                    seq: index % 2 === 0 ? index + 1 : index,
                };
            })
            let targetData = res.data.bodies[1].map((value, index) => {
                return {
                    id: index,
                    isQuery: false,
                    lng: value[0],
                    lat: value[1],
                    seq: index % 2 === 0 ? index : index - 1,
                };
            })
            let list = queryData.concat(targetData).sort((a, b) => {
                return a.seq - b.seq
            })
            setMode(previewMode.union)
            setPreviewData({headers: UnionTableHeaders, data: list, title: title})
            message.success('Union Success.')
            dataset1.color = 'blue'
            dataset2.color = 'red'
            props.setDatasets([dataset1, dataset2])
        }).catch((e) => {
            console.log(e)
            message.error('Failed to union search.')
        })
    }

    return (
        <Flex align="center" vertical={true} style={props.style}>
            <KeywordsSearch style={{marginTop: '10px', width: '370px'}}/>
            <OptionPanel setConfig={props.setConfig}/>
            <SearchResultList disabled="true"
                              setDatasets={props.setDatasets}
                              searchRelatedRoad={searchRelatedRoad}
                              setPreviewOpen={setPreviewOpen}
                              setPreviewData={setPreviewData}
                              setMode={setMode}
            />
            <AugmentArea setDatasets={props.setDatasets}
                         setPreviewOpen={setPreviewOpen}
                         setPreviewData={setPreviewData}
                         joinSearch={joinSearch}
                         unionSearch={unionSearch}
            />
            <PreviewDrawer
                open={previewOpen}
                data={previewData}
                mode={mode}
                close={closePreview}
                setHighlight={props.setHighlight}
            />
        </Flex>
    )
}

export default ControlPanel