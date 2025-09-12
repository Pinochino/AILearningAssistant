import handleApi from '@/api/handleApi'
import { authUrls } from '@/constant/AuthUrls'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Form, FormProps, Input, Typography } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

type FieldType = {
  email?: string
}

const ForgotPasswordPage = () => {

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  const onFinish: FormProps<FieldType>['onFinish'] = async (email) => {
    console.log('Success:', email)
    try {
      setLoading(true);
      const res = await handleApi({ url: authUrls.sendOtp, method: 'POST', data: email });
      const data = await res.data;

      if (res.status < 200 || res.status > 300) {
        setErr(`Send otp fail`)
      }

      navigate('/auth/verify-otp', { state: { email } })
      form.resetFields();
      return data;
    } catch (error: any) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const [form] = Form.useForm()

  if (loading) {
    return <h2>This website have been loading</h2>
  }

  if (err) {
    return <h2>Error: {err}</h2>
  }

  return (
    <Form
      name="ForgotPassword"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      layout="vertical"
      form={form}
    >
      <Title>Forgot password</Title>
      <Form.Item<FieldType>
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Please input your email!' }]}
      >
        <Input type="email" autoComplete="new-email" placeholder='Enter your password..' />
      </Form.Item>
      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ForgotPasswordPage
