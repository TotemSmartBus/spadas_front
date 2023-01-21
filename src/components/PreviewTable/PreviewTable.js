import React, { Component } from 'react'
import TableColumn from './TableColumn'
import TableHeader from './TableHeader'
import '../globalconfig'


export default class PreviewTable extends Component {
    render() {
        const{header,rows, type} = this.props
        const colorSet = ['#669966', '#cc99cc']
        if (rows.length === 1) {

        } else {

        }
        return (
        <table border="1" class="table table-striped">
            <tbody>
                <TableHeader header={header} type={type} style={{position: 'sticky'}}/>
                {
                    rows.map((dataset, datasetIdx)=>(
                        dataset.map((item,idx)=>(
                            <TableColumn key={idx} body={item} rowNum={idx} type={type} color={colorSet[datasetIdx%2]}/>
                        ))
                    ))
                } 
            </tbody>
        </table>
        )
    }
}
