import React, { Component } from 'react'

import './ParamSetting.css'
import '../globalconfig'

export default class ParamSetting extends Component {

    state = {
        k:5,error:0,
        // modeMap:new Map([["HausDist",0],["IntersectArea",1],["GridBasedOverlap",2],["EarthMoverDist",3]]),
        // modes:["HausDist","IntersectArea","GridBasedOverlap","EarthMoverDist"],
        modeMap:new Map([["HausDist",0],["IntersectArea",1],["GridBasedOverlap",2]]),
        modes:["HausDist","IntersectArea","GridBasedOverlap"],
        selMode:"HausDist"
    }

    TopkChanged = e =>{
        this.setState({
            k: parseInt(e.target.value)
         })
    }

    ErrorChanged = e =>{
        this.setState({
            error: parseInt(e.target.value)
         })
    }

    PreRowChanged = e =>{
        this.setState({
            preRows: parseInt(e.target.value)
         })
    }

    setBtnClicked = ()=>{
        global.config.k = this.state.k
        global.config.error = this.state.error
        global.config.preRows = this.state.preRows
        global.config.mode = this.state.modeMap.get(this.state.selMode) 
        console.log(global.config);
    }


    render() {
        return (
            <div className="area">
                {/* MetricMode dropdown menu */}
                <div className="input-group mb-3 pm0 mt-3">
                    <select className="custom-select" id="inputGroupSelect02"  onChange={(e) => {this.setState({selMode:e.target.value})}} >
                    {
                        this.state.modes.map((item,index) =>{
                            return(
                                <option key={index} value={item}>{item}</option>
                            )
                        })
                    }
                    </select>
                    <div className="input-group-append">
                        <label className="input-group-text" htmlFor="inputGroupSelect02">MetricMode</label>
                    </div>

                    <div className="col">
                        <input type="number" min="0" className="form-control" placeholder="PreviewRows Default 10" onChange={this.PreRowChanged}/>
                    </div>
                </div>



                {/* number param setting */}
                <div className="form-row">
                    <div className="col-7">
                        <input type="number" min="0" className="form-control" placeholder="TopK Default 5" onChange={this.TopkChanged}/>
                    </div>
                    <div className="col">
                        <input type="number" min="0" className="form-control" placeholder="Err Default 0" onChange={this.ErrorChanged}/>
                    </div>
                </div>
                

                <button onClick={this.setBtnClicked} type="button" className="btn radiusBtn sfont" style={{position:"relative",top:"0.5rem"}}>Apply</button>

            </div>
        )
    }
}
