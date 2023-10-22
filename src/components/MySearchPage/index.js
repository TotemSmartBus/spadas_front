import React, {Component} from 'react'
import {Col, Row} from 'antd'

import LeftPart from '../LeftPart/LeftPart'
import MyMap from '../MyMap'


export default class index extends Component {

    constructor(props) {
        super(props)
        // 创建ref
        this.map = React.createRef()
    }

    state = {dsid: null}
    // 为了实现点击左侧结果栏，右侧地图可视化该结果数据集，通过设置dsid属性并让地图组件来画图而实现
    handleClickedDsChange = id => {
        this.setState({dsid: id})
    }

    componentDidMount() {
        // 在子组件中调用父组件的方法，并把当前的实例传进去
        if (this.props.onRef !== undefined) {
            this.props.onRef(this)
        }
    }

    refreshMap = () => {
        // 通过this.map.current 拿到子组件实例
        this.map.current.refreshMap()
    }

    render() {
        return (
            <Row>
                <Col flex="400px">
                    <LeftPart style={{
                        width: '100%',
                        height: '100%',
                        justify: 'center',
                        maxHeight:'800px',
                        overflow: 'hidden',
                        overflowY: 'scroll',
                        marginLeft: '2px',
                    }} onClickedDsChange={this.handleClickedDsChange}/>
                </Col>
                <Col flex="auto">
                    <MyMap ref={this.map} clickId={this.state.dsid} style={{width: '100%', height: '100%'}}/>
                </Col>
            </Row>
        )
    }
}
