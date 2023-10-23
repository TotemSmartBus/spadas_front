import React from 'react'
import {Radio} from 'antd'

const RadioOption = (params) => {
    return <Radio.Group onChange={params.callback} defaultValue={params.default} style={{marinTop: '16px'}}>
        {params.list.map((v, i) => <Radio.Button value={v} index={i}>{v}</Radio.Button>)}
    </Radio.Group>
}

export default RadioOption