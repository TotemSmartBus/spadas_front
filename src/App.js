import {Layout} from 'antd'
import React, {Component} from 'react'
import 'antd/dist/reset.css'
import SpadasContent from './components/SpadasContent/SpadasContent'
import SpadasFooter from './components/SpadasFooter/SpadasFooter'
import SpadasHeader from './components/SpadasHeader/SpadasHeader'
import global from './components/globalconfig'
import config from './config'

const {Content} = Layout

const defaultConfig = {
    rangeQueryMode: config.rangeQueryModes[0],
    pointQueryMode: config.pointQueryModes[0],
    k: config.defaultTopK,
    highlightDataset: 0,

}
export default class App extends Component {
    state = {
        globalConfig: {
            rangeQueryMode: global.config.rangeQueryMode[0],
            pointQueryMode: global.config.pointQueryMode[0],
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

    setConfig = (obj) => {
        let config = this.state.globalConfig
        config = {...config, ...obj}
        this.setState({globalConfig: config})
    }

    onRef = ref => {
        // 设置ref
        this.child = ref
    }

    // 构造函数，在组件创建时被调用，用于初始化组件的状态（state）和绑定事件处理方法
    constructor(props) {
        super(props);
        this.mainContainerRef = React.createRef();
    }

    render() {
        return (
            <Layout style={{height: '100%'}}>
                <SpadasHeader/>
                <Content style={{padding: '0', height: '800px'}}>
                    <div ref={this.mainContainerRef}>
                        <SpadasContent onRef={this.onRef} setConfig={this.setConfig}/>
                    </div>
                </Content>
                <SpadasFooter/>
            </Layout>
        );
    }
}

