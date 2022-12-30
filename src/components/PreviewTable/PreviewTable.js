import React, { Component } from 'react'
import TableColumn from './TableColumn'
import TableHeader from './TableHeader'
import '../globalconfig'


export default class PreviewTable extends Component {   
    render() {
        const{header,rows} = this.props
        return (
        <table border="1" class="table table-striped">
            <tbody>
                <TableHeader header={header}/> 
                {
                    rows.map((item,idx)=>(
                        <TableColumn key={idx} body={item}/>
                    ))
                } 
            </tbody>
        </table>
        )
    }
}
