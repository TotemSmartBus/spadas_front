import {Collapse, Flex} from 'antd'
import React from 'react'

import AugmentArea from '../Augmentarea/AugmentArea'
import KeywordsSearch from '../KeywordsSearch/KeywordsSearch'
import OptionPanel from '../OptionPanel/OptionPanel'
import SearchResultList from '../SearchHits/SearchResultList'

const LeftPart = (props) => {
    return (
        <div style={props.style} >
            <Flex justify="center" align="center" vertical={true}>
                <KeywordsSearch style={{marginTop: '10px', width: '370px'}}/>
                <Collapse size="small" style={{width: '370px', marginTop: '10px'}} defaultActiveKey="params"
                          items={[{key: 'params', label: 'Query Parameter', children: <OptionPanel/>}]}/>
                <SearchResultList onClickedDsChange={props.onClickedDsChange} disabled="true"/>
                <AugmentArea/>
            </Flex>
        </div>
    )
}

export default LeftPart