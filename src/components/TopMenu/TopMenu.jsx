import {
    CloudUploadOutlined, GithubOutlined,
    HomeOutlined, InfoCircleOutlined,
    PlayCircleOutlined,
    QuestionCircleOutlined,
    ToolOutlined,
} from '@ant-design/icons'
import {Menu} from 'antd'
import React from 'react'


function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    }
}

const items = [
    getItem('Home', 'index', <HomeOutlined/>),
    getItem('Actions', 'action', <ToolOutlined/>, [
        getItem('Upload Dataset', 'upload', <CloudUploadOutlined/>),
    ]),
    getItem('Help', 'help', <QuestionCircleOutlined/>, [
        getItem('User Guide', 'guide', <PlayCircleOutlined/>),
        getItem('About Us', 'about', <InfoCircleOutlined/>),
    ]),
    getItem('Github', 'github', <GithubOutlined/>),
]
const TopMenu = (props) => {
    return (
        <Menu
            theme="dark"
            mode="horizontal"
            items={items}
        />
    )
}

export default TopMenu