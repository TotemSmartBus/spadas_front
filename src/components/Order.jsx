import { Button, Modal, Table, message } from "antd"
import { useEffect, useState } from "react"
import axios from 'axios'

const Order = () => {
    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = () => {
        axios.get(global.config.url + 'shop')
            .then(res => {
                console.log(res.data)
                setOrders(res.data.data)
                console.log(orders)
            })
    }

    const handlePayment = (orderId) => {
        axios.get(global.config.url + 'pay', { params: { id: orderId } })
            .then(res => {
                fetchOrders()
            })
        message.success(`Pay order ${orderId} success.`)
    }

    const handleDownload = (orderId) => {
        window.open(global.config.url + 'download/' + orderId)
        // message.success(`Downloading order ${orderId}`)
    }

    const handleShowDetails = (order) => {
        console.log(order)
        setSelectedOrder(order)
        setModalVisible(true)
    }

    const handleDelete = (orderId) => {
        axios.get(global.config.url + 'delete', { params: { id: orderId } })
            .then(() => {
                fetchOrders()
            })
        message.success(`Delete order ${orderId} success.`)
    }

    const closeModal = () => {
        setModalVisible(false)
    }

    const columns = [
        {
            title: 'index',
            dataIndex: 'index',
            key: 'index',
            render: (_, record, index) => index + 1
        },
        {
            title: 'create time',
            dataIndex: 'createTime',
            key: 'createTime'
        },
        {
            title: 'dataset count',
            dataIndex: 'datasetCnt'
        },
        {
            title: 'content',
            dataIndex: 'content',
            key: 'content',
            render: (_, record) => (
                <Button type="link" onClick={() => handleShowDetails(record)}>
                    Details
                </Button>
            )
        },
        {
            title: 'price',
            dataIndex: 'totalPrice'
        },
        {
            title: 'action',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button
                        onClick={() => handlePayment(record.orderId)}
                        disabled={record.paid}
                    >
                        Pay
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => handleDownload(record.orderId)}
                        disabled={!record.paid}
                    >
                        Download
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => handleDelete(record.orderId)}
                    >
                        Delete
                    </Button>
                </span>
            )
        }
    ]

    return (
        <div style={{
            width: '800px',
            margin: '0 auto'
        }}>
            <Table columns={columns} dataSource={orders} rowKey="id" />

            <Modal
                title='Order Details'
                open={modalVisible}
                onCancel={closeModal}
                footer={null}
            >
                {selectedOrder && (
                    <Table
                        dataSource={selectedOrder.datasets}
                        columns={[
                            { title: 'filename', dataIndex: 'filename' },
                            { title: 'size', dataIndex: 'count' },
                            { title: 'price', dataIndex: 'price' }
                        ]}
                        rowKey='id'
                    />
                )}
            </Modal>
        </div>
    )
}

export default Order