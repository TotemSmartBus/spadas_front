import {Flex} from 'antd'
import React from 'react'

import AugmentArea from './Augmentarea/AugmentArea'
import KeywordsSearch from './KeywordsSearch/KeywordsSearch'
import OptionPanel from './OptionPanel/OptionPanel'
import SearchResultList from './SearchResultList/SearchResultList'

const ControlPanel = (props) => {
    return (
        <Flex align="center" vertical={true} style={props.style}>
            <KeywordsSearch style={{marginTop: '10px', width: '370px'}}/>
            <OptionPanel setConfig={props.setConfig}/>
            <SearchResultList onClickedDsChange={props.onClickedDsChange} disabled="true"/>
            <AugmentArea/>
        </Flex>
    )
}

export default ControlPanel