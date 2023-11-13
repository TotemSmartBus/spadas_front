import React from 'react'
import './previewTable.css'

const TableHeader = (props) => {
    const {header, type} = props
    if (header == null) {
        return null
    }
    let len = header.length;
    if (type === 'join') {
        return (
            <tr>
                {header.map((item, idx) => {
                    if (idx < Math.floor(len / 2)) {
                        return <th key={idx} className="headers">{item}</th>
                    } else if (idx === Math.floor(len / 2)) {
                        return <th key={idx} className="headers">{item}</th>
                    } else {
                        return <th key={idx} className="headers">{item}</th>
                    }
                })}
            </tr>
        )
    } else {
        return (
            <tr>
                {header.map((item, idx) => {
                    return <th key={idx} className="headers">{item}</th>
                })}
            </tr>
        )
    }

}

export default TableHeader
