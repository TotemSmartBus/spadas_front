import {useAtom} from 'jotai'
import {Collapse, Form, InputNumber} from 'antd'
import global from '../../../global'
import {topKState} from '../../../StateManager'
import RadioOption from './RadioOption'
import React from 'react'

const OptionPanel = (props) => {
    const [topK, setTopK] = useAtom(topKState)

    // const topK = useRef(5)

    function toggleRangeQueryMode(e) {
        props.setConfig({rangeQueryMode: e.target.value})
    }

    function togglePointQueryMode(e) {
        props.setConfig({pointQueryMode: e.target.value})
    }

    function toggleTopK(n) {
        setTopK(n)
    }

    let rangeQuery = global.config.rangeQueryMode
    let pointQuery = global.config.pointQueryMode
    const form = <Form layout="horizontal" style={{marginTop: '10px'}}>
        <Form.Item label="Range Query">
            <RadioOption onChange={toggleRangeQueryMode} list={rangeQuery} callback={toggleRangeQueryMode}
                         default={rangeQuery[0]}/>
        </Form.Item>
        <Form.Item label="Examplar Search:">
            <RadioOption list={pointQuery} callback={togglePointQueryMode} default={pointQuery[0]}/>
        </Form.Item>
        <Form.Item label="Result Limit:">
            <InputNumber min={1} max={10} defaultValue={topK} onChange={toggleTopK}/>
        </Form.Item>
    </Form>
    return <Collapse size="small" style={{width: '370px', marginTop: '10px'}} defaultActiveKey="params"
                     items={[{key: 'params', label: 'Query Parameter', children: form}]}/>

}

export default OptionPanel