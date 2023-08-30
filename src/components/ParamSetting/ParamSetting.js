import React, { Component } from 'react'
import { Button } from 'antd';
import Accordion from 'react-bootstrap/Accordion';
import './ParamSetting.css'
import '../globalconfig'

export default class ParamSetting extends Component {

    state = {
        k: 5, error: 0,
        // modeMap:new Map([["HausDist",0],["IntersectArea",1],["GridBasedOverlap",2],["EarthMoverDist",3]]),
        // modes:["HausDist","IntersectArea","GridBasedOverlap","EarthMoverDist"],
        modeMap: new Map([["Haus", 0], ["IA", 1], ["GBO", 2]]),
        examplarModes: ["Haus", "IA", "GBO"],
        rangeModes: ["IA", "GBO"],
        selExamplarMode: "Haus",
        selRangeMode: "IA"
    }

    TopkChanged = e => {
        this.setState({
            k: parseInt(e.target.value)
        })
    }

    ErrorChanged = e => {
        this.setState({
            error: parseInt(e.target.value)
        })
    }

    PreRowChanged = e => {
        this.setState({
            preRows: parseInt(e.target.value)
        })
    }

    setBtnClicked = () => {
        global.config.k = this.state.k
        global.config.error = this.state.error
        global.config.preRows = this.state.preRows
        global.config.examplarMode = this.state.modeMap.get(this.state.selExamplarMode);
        global.config.rangeMode = this.state.modeMap.get(this.state.selRangeMode);
        console.log(global.config);
    }

    componentDidUpdate() {
        global.config.k = this.state.k
        global.config.error = this.state.error
        // global.config.preRows = this.state.preRows
        global.config.examplarMode = this.state.modeMap.get(this.state.selExamplarMode);
        global.config.rangeMode = this.state.modeMap.get(this.state.selRangeMode);
        console.log(global.config);
    }


    render() {
        return (
            <div >
                {/* MetricMode dropdown menu */}

                <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey='0'>
                        {/* 为什么内联样式无法生效啊！ */}
                        <Accordion.Header style={{ fontSize: '20px', width: '100%', border: "none" }}>Parameter Settings      ∨</Accordion.Header>
                        <Accordion.Body >
                            <div className="input-group mb-3 pm0 mt-1" style={{ width: '200px' }}>
                                <select className="custom-select" id="inputGroupSelect01" onChange={(e) => { this.setState({ selExamplarMode: e.target.value }) }} >
                                    {
                                        this.state.examplarModes.map((item, index) => {
                                            return (
                                                <option key={index} value={item}>{item}</option>
                                            )
                                        })
                                    }
                                </select>
                                <div className="input-group-append">
                                    <label className="input-group-text" htmlFor="inputGroupSelect01">Examplar Search</label>
                                </div>

                                <select className="custom-select" id="inputGroupSelect02" onChange={(e) => { this.setState({ selRangeMode: e.target.value }) }} >
                                    {
                                        this.state.rangeModes.map((item, index) => {
                                            return (
                                                <option key={index} value={item}>{item}</option>
                                            )
                                        })
                                    }
                                </select>
                                <div className="input-group-append">
                                    <label className="input-group-text" htmlFor="inputGroupSelect02">Range Query</label>
                                </div>

                                {/* 暂时不要这个 */}
                                {/* <div className="col">
                        <input type="number" min="0" className="form-control" placeholder="PreviewRows Default 10" onChange={this.PreRowChanged}/>
                    </div> */}
                                <div className="form-row">
                                    <div className="col-12">
                                        <input type="number" min="0" className="form-control" placeholder="TopK Default 5" onChange={this.TopkChanged} />
                                    </div>
                                    {/* 暂时删除这个参数 */}
                                    {/* <div className="col">
                        <input type="number" min="0" className="form-control" placeholder="Err Default 0" onChange={this.ErrorChanged}/>
                    </div> */}
                                </div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

                {/* <div className="input-group mb-3 pm0 mt-3" style={{ width: '400px' }}>
                    <select className="custom-select" id="inputGroupSelect01" onChange={(e) => { this.setState({ selExamplarMode: e.target.value }) }} >
                        {
                            this.state.examplarModes.map((item, index) => {
                                return (
                                    <option key={index} value={item}>{item}</option>
                                )
                            })
                        }
                    </select>
                    <div className="input-group-append">
                        <label className="input-group-text" htmlFor="inputGroupSelect01">Examplar Search</label>
                    </div>

                    <select className="custom-select" id="inputGroupSelect02" style={{ marginLeft: '10px' }} onChange={(e) => { this.setState({ selRangeMode: e.target.value }) }} >
                        {
                            this.state.rangeModes.map((item, index) => {
                                return (
                                    <option key={index} value={item}>{item}</option>
                                )
                            })
                        }
                    </select>
                    <div className="input-group-append">
                        <label className="input-group-text" htmlFor="inputGroupSelect02">Range Query</label>
                    </div>

                    {/* 暂时不要这个 */}
                {/* <div className="col">
                        <input type="number" min="0" className="form-control" placeholder="PreviewRows Default 10" onChange={this.PreRowChanged}/>
                    </div> 
                </div> */}



                {/* number param setting */}
                {/* <div className="form-row">
                    <div className="col-7">
                        <input type="number" min="0" className="form-control" placeholder="TopK Default 5" onChange={this.TopkChanged} />
                    </div> */}
                    {/* 暂时删除这个参数 */}
                    {/* <div className="col">
                        <input type="number" min="0" className="form-control" placeholder="Err Default 0" onChange={this.ErrorChanged}/>
                    </div> */}
                {/* </div> */}


                {/* <button onClick={this.setBtnClicked} type="button" className="btn radiusBtn sfont" style={{ position: "relative", top: "0.5rem" }}>Apply</button> */}
            </div>
        )
    }
}
