import {Layout} from 'antd'
import React, {Component} from 'react'
import 'antd/dist/reset.css'
import Logo from './components/Logo/Logo'
import './App.css'
import TopMenu from './components/TopMenu/TopMenu'
import MySearchPage from './components/MySearchPage'

const {Header, Content, Footer} = Layout

export default class App extends Component {
    state = {
        showSSS: false,
        globalConfig: {
            rangeQueryMode: '',
            pointQueryMode: '',
            url: process.env.REACT_APP_BACKEND_URL,
            k: 5,
            error: 0,
            examplarMode: 0,
            rangeMode: 1,
            preRows: 20,
            traNum: 200,
            unionIds: [],
        },
    }

    onRef = ref => {
        // 设置ref
        this.child = ref
    }

    // 构造函数，在组件创建时被调用，用于初始化组件的状态（state）和绑定事件处理方法
    constructor(props) {
        super(props);
        // 创建一个用于引用react组件或dom元素的应用（ref）的方法，返回一个ref对象，可以被赋值给组件或dom元素的ref属性，
        // 从而可以在代码中直接引用该组件或dom元素
        // 组件是开发者编写的可重用代码块，用于描述ui的一部分
        // dom元素是浏览器中的实际元素节点，如div、span、p等
        // 组件可以渲染为一个或多个dom元素
        this.sssContainerRef = React.createRef();
        this.mainContainerRef = React.createRef();
    }

    render() {
        return (
            <Layout style={{height:'100%'}}>
                <Header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Logo />
                    <TopMenu />
                </Header>
                <Content style={{padding: '0', height: '800px'}}>
                    <div ref={this.mainContainerRef}>
                        <MySearchPage onRef={this.onRef}/>
                    </div>
                </Content>
                <Footer style={{textAlign: 'center'}}>Spadas ©2023 Created by <a href='http://sheng.whu.edu.cn'>Sheng's Group</a></Footer>
            </Layout>
        );
    }
}

