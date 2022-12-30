import React, { Component } from 'react'

import LeftPart from '../LeftPart/LeftPart'
import MyMap from '../MyMap'


export default class index extends Component {

    constructor(props) {
	    super(props)
        // 创建ref
	 	this.map = React.createRef()
	}

    state = { dsid: null }
    handleClickedDsChange = id => {
        console.log(id)
        this.setState({ dsid: id })
    }

    componentDidMount() {
        // 在子组件中调用父组件的方法，并把当前的实例传进去
        if (this.props.onRef != undefined) {
            this.props.onRef(this)
        }
    }
    // onRef = ref => {
    //     this.MyMap = ref
    // }

    refreshMap = () => {
        // 通过this.map.current 拿到子组件实例
        this.map.current.refreshMap()
    }

    render() {
        return (
            <div className="row" style={{ margin: "0", padding: "0" }}>
                <div className="col-sm-4">
                    <LeftPart onClickedDsChange={this.handleClickedDsChange} />
                </div>
                <div className="col-md-8" style={{ margin: "0", padding: "0" }}>
                    <MyMap ref={this.map} clickId={this.state.dsid}   />
                </div>
                {/* <button onClick={this.refreshMap} /> */}
            </div>
        )
    }
}
