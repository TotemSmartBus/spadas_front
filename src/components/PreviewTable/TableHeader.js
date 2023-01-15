import React, {Component} from 'react'

export default class TableHeader extends Component {
    render() {
        const {header, type} = this.props
        if (header == null) {
            return null
        }
        const hiddenHeaders = ['province', 'city', 'area', 'address']
        if (type === 'join') {
            return (
                <tr>
                    {header.map((item, idx) => {
                        if (hiddenHeaders.contain(item)) {
                            return null
                        }
                        return <th key={idx}>{item}</th>
                    })}
                </tr>
            )
        } else {
            return (<tr>
                {header.map((item, idx) => {
                    return <th key={idx}>{item}</th>
                })}
            </tr>)
        }
    }
}
