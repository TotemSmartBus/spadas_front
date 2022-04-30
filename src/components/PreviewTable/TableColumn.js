import React, { Component } from 'react'

export default class TableColumn extends Component {
    render() {
        const {body} = this.props
        return (
            <tr>
                {body.map((item,idx)=>(
                    <td key={idx}>{item}</td>
                ))}
            </tr>
        )
    }
}
