import {Collapse, Form, InputNumber} from 'antd'
import global from '../../../global'
import RadioOption from './RadioOption'
import React from 'react'

const QueryParameters = (props) => {
    function toggleRangeQueryMode(e) {
        let parameters = props.parameters
        parameters.rangeQueryMode = e.target.value
        props.setParameters(parameters)
    }

    function togglePointQueryMode(e) {
        let parameters = props.parameters
        parameters.pointQueryMode = e.target.value
        props.setParameters(parameters)
    }

    function toggleTopK(n) {
        let parameters = props.parameters
        parameters.topK = n
        props.setParameters(parameters)
    }

    const form = <Form layout="horizontal" style={{marginTop: '10px'}}>
        <Form.Item label="Range Query">
            <RadioOption onChange={toggleRangeQueryMode} list={global.config.rangeQueryMode}
                         callback={toggleRangeQueryMode}
                         default={props.parameters.rangeQueryMode}/>
        </Form.Item>
        <Form.Item label="Examplar Search:">
            <RadioOption list={global.config.pointQueryMode} callback={togglePointQueryMode}
                         default={props.parameters.pointQueryMode}/>
        </Form.Item>
        <Form.Item label="Result Limit:">
            <InputNumber min={1} max={10} defaultValue={props.parameters.topK} onChange={toggleTopK}/>
        </Form.Item>
    </Form>
    return <Collapse size="small" style={{width: '370px', marginTop: '10px'}} defaultActiveKey="params"
                     items={[{key: 'params', label: 'Query Parameter', children: form}]}/>

}

export default QueryParameters