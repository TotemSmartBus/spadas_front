import {Avatar} from 'antd'
import React from 'react'
import logo from './spadas.png'

const Logo = () => {
    return (
        <div>
            <Avatar src={logo} alt="Spadas Logo" size={60}/>
            <h1 style={{
                display: 'inline-block',
                color: '#00a2ae',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
            }}>Spade</h1>
        </div>)
}
export default Logo