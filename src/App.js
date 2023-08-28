import React, { Component } from 'react'

import './App.css';
import Top from "./components/Top/Top"
import MySearchPage from './components/MySearchPage'
import SSS from './components/SSS/SSS';
import { Toaster } from 'react-hot-toast';



export default class App extends Component {
  onRef = ref => {
    // 设置ref
    this.child = ref
  }

  refreshMapMain = () => {
    // 通过this.child拿到子组件实例
    this.child.refreshMap()
  }

  // 构造函数，在组件创建时被调用，用于初始化组件的状态（state）和绑定事件处理方法
  constructor(props) {
    super(props);
    this.state = {
      showSSS: false,
      showMain: true
    };
    // 创建一个用于引用react组件或dom元素的应用（ref）的方法，返回一个ref对象，可以被赋值给组件或dom元素的ref属性，
    // 从而可以在代码中直接引用该组件或dom元素
    // 组件是开发者编写的可重用代码块，用于描述ui的一部分
    // dom元素是浏览器中的实际元素节点，如div、span、p等
    // 组件可以渲染为一个或多个dom元素
    this.sssContainerRef = React.createRef();
    this.mainContainerRef = React.createRef();
  }

  // 点击switch开关元素，切换state，进而切换显示的组件
  toggleSSS = () => {
    this.setState(prevState => ({
      showSSS: !prevState.showSSS,
      showMain: !prevState.showMain
    }))
  }

  render() {
    return (
      <div className="App">
        <div className="container-fluid" style={{ margin: "0", padding: "0" }}>
          <Toaster position='top-center' toastOptions={{ duration: 2000 }}/>
          {/* 父组件传递方法给子组件 */}
          <Top refreshMapMain={this.refreshMapMain} toggleSSS={this.toggleSSS} />
          {/* 设置ref属性 */}
          <div ref={this.mainContainerRef} style={{
            display: this.state.showMain ? 'block' : 'none'
          }}>
            <MySearchPage onRef={this.onRef} />
          </div>
          {/* <MySearchPage onRef={this.onRef} /> */}
          {/* <button onClick={this.refreshMapMain} /> */}
          {/* <Route exact path="/" component={Myheader}/>
          <Route path='/search' component={SearchPage} /> 
          <Route path='/demo' component={Demo}/> */}
          <div ref={this.sssContainerRef} style={{
            display: this.state.showSSS ? 'block' : 'none',
            // display: 'none',
            width: '100%',
            height: '800px'
          }}>
            <SSS />
          </div>
        </div>
      </div>
    );
  }
}

