import {Drawer, Empty, Skeleton, Table} from 'antd'

const PreviewDrawer = (props) => {
    let content = <Skeleton/>
    let tableTitle = ''
    if (props.data) {
        debugger
        if (props.data.data === undefined) {
            content = <Empty/>
        }
        tableTitle = props.data.title
        content = <Table dataSource={props.data.data} columns={props.data.headers}/>
    }
    // if (props.data) {
    //     if (props.data.node === undefined || props.data.node.matrix === undefined || props.data.node.matrix.length === 0) {
    //         content = <Empty/>
    //     } else {
    //         tableData = props.data.node.matrix.map(arr => {
    //             return {lat: arr[1], lng: arr[0]}
    //         })
    //         tableTitle = props.data.node.fileName
    //         content = <Table dataSource={tableData} columns={tableHeaders}/>
    //     }
    // }
    return <Drawer
        title="Dataset Preview"
        width={700}
        open={props.open}
        onClose={props.close}
        // extra={}
    >
        <h2>{tableTitle}</h2>
        {content}
    </Drawer>
}

export default PreviewDrawer