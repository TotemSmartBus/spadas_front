import React, { Component } from 'react'
import PubSub from 'pubsub-js'

import SearchDetail from '../SearchDetail/SearchDetail'
import './SearchHits.css'
import '../globalconfig'

export default class SeachHits extends Component {

    constructor(props){
        super(props)
        this.state = {data:[],selid:null,selMatrix:[],selFilename:"",selDsType:0}
    }
    componentDidMount(){
		this.token1 = PubSub.subscribe('searchhits',(_,stateObj)=>{
            this.setState(stateObj)
            //console.log(this.state)
        })

        this.token2 = PubSub.subscribe('mapClickNode',(_,node)=>{
            console.log(node);
             var list = []
             list.push(node)
             this.setState({data:list})
        })
        
    }
    componentWillUnmount(){
		PubSub.unsubscribe(this.token1)
    }
    
    handleClickedDs = e =>{
        /**
         *  div与btn的点击事件分离
         */
        var idx = e.target.getAttribute("idx")
        let union = document.querySelector("#union"+idx)
        let join = document.querySelector("#join"+idx)
        if(union||join){
         
                if(union.contains(e.target)){
                    // div union btn点击事件
                    PubSub.publish("union",{id:e.target.getAttribute("dsid"),filename:e.target.getAttribute("filename"),matrix:this.state.data[e.target.getAttribute('idx')].matrix})
                }
                // else{
                //     //div(除btn)点击事件
                //     this.props.onClickedDsChange(e.target.getAttribute('dsid'))
                //     this.setState({selid:e.target.getAttribute('dsid'),selMatrix:this.state.data[e.target.getAttribute('idx')].matrix,selFilename:this.state.data[e.target.getAttribute('idx')].filename,selDsType:0})
                // }  
            
      
                //div join btn 点击事件
                if(join.contains(e.target)){
                    PubSub.publish("join",{id:e.target.getAttribute("dsid"),filename:e.target.getAttribute("filename"),matrix:this.state.data[e.target.getAttribute('idx')].matrix})
                }
                else{
                    //div(除btn)点击事件
                    //console.log(e.target);
                    this.props.onClickedDsChange(e.target.getAttribute('dsid'))
                    this.setState({selid:e.target.getAttribute('dsid'),selMatrix:this.state.data[e.target.getAttribute('idx')].matrix,selFilename:this.state.data[e.target.getAttribute('idx')].filename,selDsType:this.state.data[e.target.getAttribute('idx')].node.type})
                }  
            
        }   
        else{
            //div(除btn)点击事件
            this.props.onClickedDsChange(e.target.getAttribute('dsid'))
            //console.log(this.state.data[e.target.getAttribute('idx')].node.type);
            this.setState({selid:e.target.getAttribute('dsid'),selMatrix:this.state.data[e.target.getAttribute('idx')].matrix,selFilename:this.state.data[e.target.getAttribute('idx')].filename,selDsType:this.state.data[e.target.getAttribute('idx')].node.type})
        }    
    }
    
    render() {
        console.log(this.state);
        return (
            <div>
                <div className="card row pre-scrollable hitbox" style={{display:"block" ,marginTop: "1rem"}}>
                    <div className="card-header">
                        SearchHits
                    </div>            
                    <div role="tabpanel">
                        <div className="list-group" id="myList" role="tablist">
                        {
                            // this.state.data.map((item,idx)=>(
                            // (
                            //     idx===0? 
                            //     <a className="list-group-item list-group-item-action active" onClick={this.handleClickedDs} idx={idx} key={idx} data-toggle="list" href={item.datasetID}  role="tab" dsid={item.datasetID}>{item.datasetID+".csv"}
                            //     <span className="badge badge-primary badge-pill augbtn">2</span></a> :
                            //     <a className="list-group-item list-group-item-action" onClick={this.handleClickedDs} idx={idx} key={idx} data-toggle="list" href={item.datasetID}  role="tab" dsid={item.datasetID}>{item.datasetID+".csv"}</a>
                            // )))

                            this.state.data.map((item,idx)=>(
                                <div onClick={this.handleClickedDs} className="list-group-item list-group-item-action" idx={idx} key={idx} dsid={item.node.datasetID}>{item.filename}
                                {/* {
                                    item.node.type===0? */}
                                     <button id={"union"+idx} dsid={item.node.datasetID} idx={idx} filename={item.filename} className="haha badge badge-primary badge-pill augbtn">Union</button>:
                                     <button id={"join"+idx} dsid={item.node.datasetID} idx={idx} filename={item.filename} className="haha badge badge-primary badge-pill augbtn mr-2">Join</button>
                                {/* } */}
                                </div>
                            ))
                            
                        }
                        </div>
                    </div> 
                    
                </div>
                <SearchDetail id={this.state.selid} matrix={this.state.selMatrix} filename={this.state.selFilename} type={this.state.selDsType}/>
            </div>
            
        )
    }
}
