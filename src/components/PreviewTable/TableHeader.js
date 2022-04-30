import React, { Component } from 'react'

export default class TableHeader extends Component {
    render() {
        const {header} = this.props
        return (
            <tr>
                {header.map((item,idx)=>(
                    <th key={idx}>{item}</th>
                ))}
            </tr>
        )
    }
}
