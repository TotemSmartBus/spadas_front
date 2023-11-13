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

function refreshPage() {
    window.location.reload()
}

function openDocument() {
    window.open('./Spadas-Guideline.pdf')
}

function openOfficialSite() {
    window.open('http://sheng.whu.edu.cn')
}

function openGithub() {
    window.open("https://github.com/TotemSmartBus/spadas")
}

function onClick(item) {
    switch (item.key) {
        case 'index': refreshPage();break
        case 'upload': break
        case 'guide': openDocument();break
        case 'about': openOfficialSite();break
        case 'github': openGithub();break
        default: return false
    }
    return false
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
            onClick={onClick}
        />
    )
}

export default TopMenu