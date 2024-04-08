import React, { useState } from 'react';
import axios from 'axios'
import { message } from 'antd'
import { NavigationUtils } from './SpadasHeader/TopMenu/NavigationUtils'
import { Form, Input, Button, Checkbox } from 'antd'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { navigateToHome } = NavigationUtils()

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = () => {
    // 在这里处理登录逻辑
    console.log('Login clicked with:', { username, password })
    axios.post(global.config.url + 'login', {
      username: username,
      password: password
    }).then(res => {
      console.log(res.data)
      if (res.data.success === true) {
        message.success(`User ${username} login success.`)
        navigateToHome()
      } else {
        message.error(res.data.errorMsg)
      }
    })
  };

  const handleRegister = () => {
    // 在这里处理注册逻辑
    console.log('Register clicked with:', { username, password })
    axios.post(global.config.url + 'register', {
      username: username,
      password: password
    }).then(res => {
      console.log(res.data)
      if (res.data.success === true) {
        message.success(`User ${username} register success.`)
        navigateToHome()
      } else {
        message.error(res.data.errorMsg)
      }
    })
  };

  return (
    <div>
      <Form style={{
        width: '300px',
        height: '200px',
        margin: 'auto',
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '20px'
      }}>
        <Form.Item
          label='Username'
          name="username"
          rules={[{ required: true, message: 'Please input your username.' }]}>
          <Input onChange={(e) => setUsername(e.target.value)} />
        </Form.Item>

        <Form.Item
          label='Password'
          name='password'
          rules={[{ required: true, message: 'Please input your password.' }]}>
          <Input.Password onChange={(e) => setPassword(e.target.value)} />
        </Form.Item>

        <Form.Item> 
          <Button onClick={handleLogin}>
            Login
          </Button>
          <Button onClick={handleRegister} style={{ marginLeft: '108px'}}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
