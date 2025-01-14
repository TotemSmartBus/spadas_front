import React from 'react'
import {Tooltip} from "react-tooltip";

const TableColumn = (props) => {
    // FIXME: Tricky style
    const hiddenCols = [3, 4, 5, 6, 13, 14, 15, 16]
    const {body, rowNum, type, color} = props
    let leftTooltip = '', rightTooltip = ''
    let middle = Math.floor(body.length / 2);
    if (type === 'join') {
        return (
            <tr>
                {body.map((item, idx) => {
                    var bgColor
                    if (idx < middle) {
                        bgColor = '#669966'
                    } else if (idx > middle) {
                        bgColor = '#cc99cc'
                    } else {
                        bgColor = '#cccccc'
                    }
                    if (body.length > 6 && hiddenCols.includes(idx)) {
                        if (idx < middle) {
                            leftTooltip = leftTooltip + item + '\n'
                        } else {
                            rightTooltip = rightTooltip + item + '\n'
                        }
                        return null
                    }
                    if (idx === 0) {
                        return <td key={idx} style={{backgroundColor: bgColor}} data-tip
                                   data-for={'leftTooltip-r' + rowNum}>{item}</td>
                    }
                    if (idx === middle + 1) {
                        return <td key={idx} style={{backgroundColor: bgColor}} data-tip
                                   data-for={'rightTooltip-r' + rowNum}>{item}</td>
                    }
                    return <td key={idx} style={{backgroundColor: bgColor}}>{item}</td>
                })}
                <Tooltip id={'leftTooltip-r' + rowNum}>{leftTooltip}</Tooltip>
                <Tooltip id={'rightTooltip-r' + rowNum}>{rightTooltip}</Tooltip>
            </tr>
        )
    } else {
        return (
            <tr style={{backgroundColor: color}}>
                {body.map((item, idx) => {
                    return <td key={idx}>{item}</td>
                })}
            </tr>
        )
    }
}
export default TableColumn
