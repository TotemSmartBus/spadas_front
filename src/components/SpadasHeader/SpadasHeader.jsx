import {Layout} from 'antd'
import React from 'react'
import Logo from './Logo/Logo'
import TopMenu from './TopMenu/TopMenu'

const {Header} = Layout


const HeaderStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
}

const SpadasHeader = (props) => {
    return <Header style={HeaderStyle}>
        <Logo/>
        <TopMenu/>
    </Header>
}

export default SpadasHeader