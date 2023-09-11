import React, {Component} from 'react'
import './previewTable.css'

export default class TableHeader extends Component {
    render() {
        console.log(this.props);
        const {header, type} = this.props
        if (header == null) {
            return null
        }
        // const hiddenHeaders = ['province', 'city', 'area', 'address']
        // if (type === 'join') {
        //     return (
        //         <tr>
        //             {header.map((item, idx) => {
        //                 if (hiddenHeaders.contain(item)) {
        //                     return null
        //                 }
        //                 return <th key={idx}>{item}</th>
        //             })}
        //         </tr>
        //     )
        // } else {
        //     return (<tr>
        //         {header.map((item, idx) => {
        //             return <th key={idx}>{item}</th>
        //         })}
        //     </tr>)
        // }
        var len = header.length;
        if (type === 'join') {
            return (
                <tr>
                    {header.map((item, idx) => {
                        if (idx < Math.floor(len / 2)) {
                            return <th key={idx} className='headers'>{item}</th>
                        } else if (idx === Math.floor(len / 2)) {
                            return <th key={idx} className='headers'>{item}</th>
                        } else {
                            return <th key={idx} className='headers'>{item}</th>
                        }
                    })}
                </tr>
            )
        } else {
            return (
                <tr>
                    {header.map((item, idx) => {
                        return <th key={idx} className='headers'>{item}</th>
                    })}
                </tr>
            )
        }
    }
}
