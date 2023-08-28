import React, { Component } from 'react'
import TableColumn from './TableColumn'
import TableHeader from './TableHeader'
import '../globalconfig'


export default class PreviewTable extends Component {
    render() {
        console.log(this.props);
        const { header, rows, type } = this.props
        // const colorSet = ['#669966', '#cc99cc']
        const colorSet = ['lightcyan', 'cyan', 'darkcyan'];
        // if (rows.length > 1) {
        //     rows = rows.slice(1);
        // }
        // const row = [...rows[0]]

        if (rows !== null) {
            return (
                <table border="1" class="table table-striped">
                    <tbody>
                        <TableHeader header={header} type={type} style={{ position: 'sticky' }} />
                        {
                            // rows.map((dataset, datasetIdx) => (
                            //     dataset.map((item, idx) => (
                            //         <TableColumn key={idx} body={item} rowNum={idx} type={type} color={colorSet[datasetIdx % 2]} />
                            //     ))
                            // ))
                            rows.length > 0 ? (
                                rows[0].map((item, idx) => (
                                    <TableColumn key={idx} body={item} type={type} color={'pink'} />
                                ))
                            ) : null
                        }
                        {
                            rows.length > 1 ? (
                                rows.slice(1).map((dataset, datasetIdx) => (
                                    dataset.map((item, idx) => (
                                        <TableColumn key={idx} body={item} type={type} color={colorSet[datasetIdx % 3]} />
                                    ))
                                ))
                            ) : null
                        }
                    </tbody>
                </table>
            )
        } else {
            return null;
        }


        // if (rows.length === 1) {

        // } else {

        // }

    }
}
