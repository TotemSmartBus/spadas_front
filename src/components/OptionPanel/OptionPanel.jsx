import {createContext, useRef, useState} from 'react'
import {Form, InputNumber} from 'antd'
import global from '../globalconfig'
import RadioOption from './RadioOption'
import React from 'react'


export const RangeQueryModeContext = createContext()
export const PointQueryModeContext = createContext()

function OptionPanel() {
    const [rangeQueryMode, setRangeQueryMode] = useState(global.config.rangeQueryMode[0])
    const [pointQueryMode, setPointQueryMode] = useState(global.config.pointQueryMode[0])
    const topK = useRef(5)
    function toggleRangeQueryMode(e) {
        setRangeQueryMode(e.target.value)
    }

    function togglePointQueryMode(e) {
        setPointQueryMode(e.target.value)
    }
    function toggleTopK(n) {
        topK.current = n
    }

    let rangeQuery = global.config.rangeQueryMode
    let pointQuery = global.config.pointQueryMode
    return <Form layout='horizontal' style={{marginTop:'10px'}}>
        <Form.Item label='Range Query'>
            <RangeQueryModeContext.Provider value={rangeQueryMode}>
                <RadioOption list={rangeQuery} callback={toggleRangeQueryMode} default={rangeQuery[0]}/>
            </RangeQueryModeContext.Provider>
        </Form.Item>
        <Form.Item label="Examplar Search:">
            <PointQueryModeContext.Provider value={pointQueryMode}>
                <RadioOption list={pointQuery} callback={togglePointQueryMode} default={pointQuery[0]}/>
            </PointQueryModeContext.Provider>
        </Form.Item>
        <Form.Item label="Result Limit:">
            <PointQueryModeContext.Provider value={pointQueryMode}>
                <InputNumber min={1} max={10} defaultValue={5} onChange={toggleTopK} />
            </PointQueryModeContext.Provider>
        </Form.Item>
    </Form>
}

export default OptionPanel