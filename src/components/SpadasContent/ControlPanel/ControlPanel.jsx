import {Flex, message, Tooltip} from 'antd'
import axios from 'axios'
import React, {useState} from 'react'

import AugmentArea from './Augmentarea/AugmentArea'
import PreviewDrawer from './Augmentarea/PreviewDrawer/PreviewDrawer'
import KeywordsSearch from './KeywordsSearch/KeywordsSearch'
import OptionPanel from './OptionPanel/OptionPanel'
import SearchResultList from './SearchResultList/SearchResultList'


(function () {
    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number}      The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === "undefined" || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split("e");
        value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
        // Shift back
        value = value.toString().split("e");
        return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust("round", value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function (value, exp) {
            return decimalAdjust("floor", value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function (value, exp) {
            return decimalAdjust("ceil", value, exp);
        };
    }
})()


const FindRoadTableHeaders = [{
    title: 'ID',
    dataIndex: 'pointID',
    key: 'pointID',
}, {
    title: 'Road ID',
    dataIndex: 'roadID',
    key: 'roadID',
}, {
    title: 'Distance',
    dataIndex: 'distance',
    key: 'distance',
}, {
    title: 'Road Points',
    dataIndex: 'roadPoints',
    key: 'roadPoints',
    render: (ps) => {
        if (ps == null) {
            return '/'
        }
        let fullList = ps.map(p => '[' + p[0] + ',' + p[1] + ']')
        let shortList = ps.map(p => '[' + Math.round10(p[0], -2) + ',' + Math.round10(p[1], -2) + ']')
        let shortContent = ''
        switch (shortList.length) {
            case 0:
                shortContent = '[]';
                break;
            case 1:
                shortContent = shortList[0];
                break;
            case 2:
                shortContent = shortList[0] + ',' + shortList[1];
                break;
            default:
                shortContent = shortList[0] + ',...(' + (ps.length - 2) + ')...,' + shortList[shortList.length - 1]
        }
        let fullContent = ''
        for (let i = 0; i < fullList.length; i++) {
            fullContent += fullList[i] + '\n';
        }
        return (
            <p>
                <Tooltip title={fullContent}>
                    {shortContent}
                </Tooltip>
            </p>
        )
    },
}]
const ControlPanel = (props) => {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewData, setPreviewData] = useState({headers: [], data: []})

    function closePreview() {
        setPreviewOpen(false)
    }

    function searchRelatedRoad(id) {
        console.log("clicked search road for " + id)
        setPreviewOpen(true)
        axios.post(global.config.url + 'findRoad?id=' + id)
            .then(res => {
                if (res.status !== 200) {
                    message.warning('Server return code' + res.status)
                    return
                }
                let data = res.data
                setPreviewData({headers: FindRoadTableHeaders, data: data, title: 'Related Road for Dataset ' + id})
            }).catch(err => {
            console.error(err)
            message.warning(err)
        })
    }

    return (
        <Flex align="center" vertical={true} style={props.style}>
            <KeywordsSearch style={{marginTop: '10px', width: '370px'}}/>
            <OptionPanel setConfig={props.setConfig}/>
            <SearchResultList disabled="true"
                              onClickedDsChange={props.onClickedDsChange}
                              searchRelatedRoad={searchRelatedRoad}
                              setPreviewOpen={setPreviewOpen}
                              setPreviewData={setPreviewData}
            />
            <AugmentArea onClickedDsChange={props.onClickedDsChange} setPreviewOpen={setPreviewOpen}
                         setPreviewData={setPreviewData}/>
            <PreviewDrawer open={previewOpen} data={previewData} close={closePreview}/>
        </Flex>
    )
}

export default ControlPanel