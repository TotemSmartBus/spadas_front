import React, { Component } from 'react'

import './App.css';
import Top from "./components/Top/Top"
import MySearchPage from './components/MySearchPage'



export default class App extends Component {

	render() {
    return (
      <div className="App">
        <div className="container-fluid" style={{margin:"0",padding:"0"}}>
          <Top/>
          <MySearchPage/>  

          {/* <Route exact path="/" component={Myheader}/>
          <Route path='/search' component={SearchPage} /> 
          <Route path='/demo' component={Demo}/> */}
        </div> 
      </div>
    );
	}
}

