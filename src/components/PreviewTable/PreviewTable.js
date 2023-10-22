import React from 'react'
import TableColumn from './TableColumn'
import TableHeader from './TableHeader'
import '../globalconfig'

const PreviewTable = (props) => {
    const {header, rows, type} = props
    const colorSet = ['lightcyan', 'cyan', 'darkcyan'];

    if (rows !== null) {
        return (
            <table border="1" className="table table-striped">
                <tbody>
                <TableHeader header={header} type={type} style={{position: 'sticky'}}/>
                {
                    rows.length > 0 ? (
                        rows[0].map((item, idx) => (
                            <TableColumn key={idx} body={item} type={type} color={'pink'}/>
                        ))
                    ) : null
                }
                {
                    rows.length > 1 ? (
                        rows.slice(1).map((dataset, datasetIdx) => (
                            dataset.map((item, idx) => (
                                <TableColumn key={idx} body={item} type={type} color={colorSet[datasetIdx % 3]}/>
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
}

export default PreviewTable
