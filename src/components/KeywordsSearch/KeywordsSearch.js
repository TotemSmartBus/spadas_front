import axios from 'axios'
import React, {useState} from 'react'
import {Input, message} from 'antd'
import PubSub from 'pubsub-js'

const {Search} = Input


const KeywordsSearch = (props) => {
    const [loading, setLoading] = useState(false)

    function noResultMessage() {
        message.error('No Result')
    }

    function search(value, _e, info) {
        setLoading(true)
        axios.post(global.config.url + 'keywordsquery', {kws: value, limit: global.config.k})
            .then(res => {
                setLoading(false)
                if (res.data.nodes.length === 0) {
                    noResultMessage()
                }
                var nodeList = res.data.nodes.map(item => item.node);
                PubSub.publish('searchhits', {
                    data: nodeList,
                    isTopk: false,
                });
            })
    }

    return (
        <Search style={props.style} placeholder="Input query here" onSearch={search} allowClear enterButton loading={loading}/>
    )
}

export default KeywordsSearch