import {Drawer, Empty, Skeleton, Table} from 'antd'

import {previewMode} from '../../previewHelper'

const PreviewDrawer = (props) => {
    let content = <Skeleton/>
    let tableTitle = ''
    if (props.data) {
        // if (props.data.data === undefined) {
        //     content = <Empty/>
        // }
        tableTitle = props.data.title
        content = <Table
            onRow={(record) => {
                return {
                    onClick: (e) => {
                        switch (props.mode) {
                            case previewMode.view:
                                props.setHighlight({
                                    points: [[record.lng, record.lat]],
                                    roads: [],
                                })
                                break
                            case previewMode.road:
                                props.setHighlight({
                                    points: [record.point],
                                    roads: [{
                                        id: record.roadID,
                                        points: record.roadPoints,
                                    }],
                                })
                                break
                            case previewMode.join:
                                props.setHighlight({
                                    points: [record.queryPoint.location, record.targetPoint.location],
                                    roads: [],
                                })
                                break
                            case previewMode.union:
                                props.setHighlight({
                                    points: [[record.lng, record.lat]],
                                    roads: [],
                                })
                                break
                            default:
                                console.error('unknown type preview: ' + props.mode)
                        }
                    },
                }
            }}
            dataSource={props.data.data}
            columns={props.data.headers}
            size={'small'}
            cellFontSize={16}
            style={{fontSize: 16}}
        />
    }
    return <Drawer
        title="Dataset Preview"
        width={550}
        open={props.open}
        onClose={props.close}
        placement={'right'}
        mask={false}
    >
        <h2>{tableTitle}</h2>
        {content}
    </Drawer>
}

export default PreviewDrawer