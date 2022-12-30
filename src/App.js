import React, { Component } from 'react'

import './App.css';
import Top from "./components/Top/Top"
import MySearchPage from './components/MySearchPage'



export default class App extends Component {
  onRef = ref => {
    // 设置ref
    this.child = ref
  }

  refreshMapMain = () => {
    // 通过this.child拿到子组件实例
    this.child.refreshMap()
  }

	render() {
    return (
      <div className="App">
        <div className="container-fluid" style={{margin:"0",padding:"0"}}>
          {/* 父组件传递方法给子组件 */}
          <Top refreshMapMain={this.refreshMapMain} />
          <MySearchPage onRef={this.onRef}/>  
          {/* <button onClick={this.refreshMapMain} /> */}
          {/* <Route exact path="/" component={Myheader}/>
          <Route path='/search' component={SearchPage} /> 
          <Route path='/demo' component={Demo}/> */}
        </div> 
      </div>
    );
	}
}

