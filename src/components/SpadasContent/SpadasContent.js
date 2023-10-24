import React, {useState} from 'react'
import {Col, Row} from 'antd'

import ControlPanel from './ControlPanel/ControlPanel'
import SpadasMap from './SpadasMap/SpadasMap'


const SpadasContent = (props) => {
    let map = React.createRef()

    const [datasets, setDatasets] = useState([])

    if (props.onRef !== undefined) {
        props.onRef(this)
    }

    function handleClickedDsChange(dataset) {
        setDatasets([dataset])
    }

    function refreshMap() {
        map.current.refreshMap()
    }

    return (
        <Row>
            <Col flex="400px">
                <ControlPanel style={{
                    justify: 'center',
                    maxHeight: '800px',
                    overflowY: 'scroll',
                }} onClickedDsChange={handleClickedDsChange} setConfig={props.setConfig}/>
            </Col>
            <Col flex="auto">
                <SpadasMap ref={map} visibleDatasets={datasets} style={{width: '100%', height: '100%'}}/>
            </Col>
        </Row>
    )
}

export default SpadasContent