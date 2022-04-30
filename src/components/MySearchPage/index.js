import React, { Component } from 'react'

import LeftPart from '../LeftPart/LeftPart'
import MyMap from '../MyMap'


export default class index extends Component {

    state = {dsid:null}
    handleClickedDsChange = id=>{
        //console.log(id) √
        this.setState({dsid:id})
     }

    render() {
        return (
            <div className="row" style={{margin:"0",padding:"0"}}>
                <div className="col-sm-4">
                    <LeftPart onClickedDsChange={this.handleClickedDsChange}/>
                </div>
                <div className="col-md-8" style={{margin:"0",padding:"0"}}>
                    <MyMap clickId={this.state.dsid}/>
                </div>
            </div>
        )
    }
}
