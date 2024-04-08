import {
    CloudUploadOutlined, GithubOutlined,
    HomeOutlined, InfoCircleOutlined,
    PlayCircleOutlined,
    QuestionCircleOutlined,
    ToolOutlined,
    LoginOutlined,
    LogoutOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons'
import { Menu, message } from 'antd'
import React from 'react'
import { NavigationUtils } from './NavigationUtils'
import axios from 'axios'

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

const items = [
    getItem('Home', 'index', <HomeOutlined />),
    getItem('Actions', 'action', <ToolOutlined />, [
        getItem('Upload Dataset', 'upload', <CloudUploadOutlined />),
    ]),
    getItem('Help', 'help', <QuestionCircleOutlined />, [
        getItem('User Guide', 'guide', <PlayCircleOutlined />),
        getItem('About Us', 'about', <InfoCircleOutlined />),
    ]),
    getItem('Github', 'github', <GithubOutlined />),
    getItem('Login', 'login', <LoginOutlined />),
    getItem('Logout', 'logout', <LogoutOutlined />),
    getItem('ShoppingCart', 'shoppingCart', <ShoppingCartOutlined />)
]

const TopMenu = (props) => {
    const { navigateToLogin, navigateToShoppingCart } = NavigationUtils()

    const handleLogin = () => {
        navigateToLogin()
    }

    const handleLogout = () => {
        axios.get(global.config.url + 'logout')
            .then(res => {
                if (res.data.success === true) {
                    message.success('User logout success.')
                } else {
                    message.error(res.data.errorMsg)
                }
            })
    }

    const handleShoppingCart = () => {
        navigateToShoppingCart()
    }

    const onClick = (item) => {
        switch (item.key) {
            case 'index': refreshPage(); break
            case 'upload': break
            case 'guide': openDocument(); break
            case 'about': openOfficialSite(); break
            case 'github': openGithub(); break
            case 'login': handleLogin(); break
            case 'logout': handleLogout(); break
            case 'shoppingCart': handleShoppingCart(); break
            default: return false
        }
        return false
    }

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