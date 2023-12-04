import React, {useState} from 'react'
import {Col, Row} from 'antd'

import ControlPanel from './ControlPanel/ControlPanel'
import SpadasMap from './SpadasMap/SpadasMap'


const SpadasContent = (props) => {
    let map = React.createRef()

    const [datasets, setDatasets] = useState([])
    const [highlight, setHighlight] = useState({points: [], roads: []})
    if (props.onRef !== undefined) {
        props.onRef(this)
    }

    return (
        <Row>
            <Col flex="400px">
                <ControlPanel
                    style={{
                        justify: 'center',
                        maxHeight: '800px',
                        overflowY: 'scroll',
                    }}
                    setDatasets={setDatasets} setConfig={props.setConfig} setHighlight={setHighlight}
                />
            </Col>
            <Col flex="auto">
                <SpadasMap ref={map} datasets={datasets} highlight={highlight} style={{width: '100%', height: '100%'}}/>
            </Col>
        </Row>
    )
}

export default SpadasContent