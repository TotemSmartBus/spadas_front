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

                <div class="accordion" id="myAccordion">
                    <div class="card border-0">
                        <div class="card-header" id="headingOne" style={{ padding: 0 }}>
                            <h5 class="mb-0" style={{ padding: 0 }}>
                                <button class="btn" style={{ marginLeft: "0"}} type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                    Parameter Settings &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;∨
                                </button>
                            </h5>
                        </div>

                        <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#myAccordion">
                            <div class="card-body" style={{ padding: 0 }}>
                                <div className="input-group" style={{ width: '300px' }}>
                                    <div class="d-inline-flex">
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

                                    </div>

                                    <div class="d-inline-flex">
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
                                    </div>



                                    <div className="form-row">
                                        <div className="col-12">
                                            <input type="number" min="0" className="form-control" placeholder="TopK Default 5" onChange={this.TopkChanged} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div class="card">
                        <div class="card-header" id="headingTwo">
                            <h5 class="mb-0">
                                <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                    折叠项 2
                                </button>
                            </h5>
                        </div>

                        <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#myAccordion">
                            <div class="card-body">
                                内容部分 2
                            </div>
                        </div>
                    </div> */}
                </div>

                {/* <div className='accordion accordion-flush' id="accordionExample">
                    <div className='accordion-item'>
                        <h2 className='accordion-header' id='headingOne'>
                            <button className='accordion-button' type='button' data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                Parameter Settings
                            </button>
                        </h2>
                        <div id='collapseOne' className='accordion-collapse collapse show' aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                            <div className='accordion-body'>
                                <div className="input-group mb-3 pm0 mt-1" style={{ width: '200px' }}>

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

                                    <div className="form-row">
                                        <div className="col-12">
                                            <input type="number" min="0" className="form-control" placeholder="TopK Default 5" onChange={this.TopkChanged} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* <Accordion defaultActiveKey="0" >
                    <Accordion.Item eventKey='0'>
                        <Accordion.Header style={{ fontSize: '20px', width: '100%', border: "none" }}>Parameter Settings      ∨</Accordion.Header>
                        <Accordion.Body >
                            <div className="input-group mb-3 pm0 mt-1" style={{ width: '200px' }}>

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

                                <div className="form-row">
                                    <div className="col-12">
                                        <input type="number" min="0" className="form-control" placeholder="TopK Default 5" onChange={this.TopkChanged} />
                                    </div>
                                </div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion> */}

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
