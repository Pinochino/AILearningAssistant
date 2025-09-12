import { useQuery } from '@tanstack/react-query'
import { Button, Form, FormProps, Input, Typography } from 'antd'
import React from 'react'

const { Title } = Typography

type FieldType = {
  email?: string
}

const ForgotPasswordPage = () => {
  // const { isPending, error, data } = useQuery({
  //     queryKey: ['sendOtp', email],
  //     queryFn: () =>  authService.sendOtp(email),
  //     enabled: !!email
  // })

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    console.log('Success:', values)
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const [form] = Form.useForm()

  if (isPending) {
    return <h2>This website have been loading</h2>
  }

  if (error) {
    return <h2>Error: {error.message}</h2>
  }

  return (
    <Form
      name='ForgotPassword'
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete='off'
      layout='vertical'
    >
      <Title>Forgot password</Title>
      <Form.Item<FieldType>
        label='Email'
        name='email'
        rules={[{ required: true, message: 'Please input your email!' }]}
      >
        <Input type='email' autoComplete='new-email' />
      </Form.Item>
      <Form.Item label={null}>
        <Button type='primary' htmlType='submit'>
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ForgotPasswordPage
