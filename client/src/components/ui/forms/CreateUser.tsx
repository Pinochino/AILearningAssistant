import { Button, Form, FormInstance, FormProps, Input } from 'antd'
import React from 'react'

type FieldType = {
  username: string
  email: string
  password: string
}

const CreateUser = (form: any) => {


  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log(`Success`, values)
  }

  const onFinishFaile: FormProps<FieldType>['onFinishFailed'] = (errInfo) => {
    console.log(`Error: `, errInfo)
  }

  return (
    <>
      <Form.Item<FieldType>
        label="Username"
        name="username"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input type='text' autoComplete='additional-nam' />
      </Form.Item>

      <Form.Item<FieldType>
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input type='email' autoComplete='email' />
      </Form.Item>

      <Form.Item<FieldType>
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password autoComplete='new-password' />
    </Form.Item>
    </>

  )
}

export default CreateUser