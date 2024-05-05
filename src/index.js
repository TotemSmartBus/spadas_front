import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Link, Routes, createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App';
import Login from './components/Login'
import reportWebVitals from './reportWebVitals'
import Order from './components/Order'
import { message } from 'antd'

message.config({
    duration: 1
})

// const router = createBrowserRouter([
//     {
//         path: '/login',
//         element: <Login />
//     },
//     {
//         path: '/shop',
//         element: <Order />
//     },
//     {
//         path: '/',
//         element: <App />
//     }
// ])

const root = createRoot(document.getElementById('root'))
root.render(
    <Router>
        <App />
    </Router>


    // {/* <Switch>
    //         <Route path="/login" component={Login} />
    //         <Route path="/home" component={App} />
    //     </Switch> */}
    // {/* <div>
    //     <ul>
    //         <li><Link to="/home">首页</Link></li>
    //         <li><Link to="/login">其他页</Link></li>
    //     </ul>
    //     <Routes>
    //         <Route path="/home" component={App} />
    //         <Route path="/login" component={Login} />
    //     </Routes>

    // </div> */}

    // < React.StrictMode >
    // <RouterProvider router={router}></RouterProvider>
    // </React.StrictMode >
)


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
