import handleApi from '@/api/handleApi'
import { authUrls } from '@/constant/AuthUrls'
import { Button, Form, FormProps, Input, Typography } from 'antd'
import React, { useState } from 'react'
import { GetProps } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

type OTPProps = GetProps<typeof Input.OTP>

const { Title } = Typography

type FieldType = {
  otp: number
}

const VerificationOtpPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState<boolean>(false)
  const [err, setErr] = useState<string | null>(null)

  const { state } = useLocation()
  const { email } = state?.email || sessionStorage.getItem('email')
  console.log(email)

  const navigate = useNavigate()

  const onChange: OTPProps['onChange'] = (text) => {
    console.log('onChange:', text)
  }

  const onInput: OTPProps['onInput'] = (value) => {
    console.log('onInput:', value)
  }

  const sharedProps: OTPProps = {
    onChange,
    onInput,
  }

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    console.log('Success:', values)
    try {
      setLoading(true)
      const otp = values.otp
      const res = await handleApi({ url: authUrls.verifyOtp, method: 'POST', data: { otp, email } })
      const data = await res.data

      if (res.status < 200 || res.status > 300) {
        setErr(res.statusText)
      }

      navigate('/auth/new-password', { state: {otp: values.otp, email} })
      return data
    } catch (error: any) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  if (loading) {
    return <h2>This website have been loading</h2>
  }

  if (err) {
    return <h2>Error: {err}</h2>
  }

  return (
    <div>
      <Form
        name="verifyOtp"
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
        <Form.Item<FieldType>
          label="Otp"
          name="otp"
          rules={[{ required: true, message: 'Please input your otp!' }]}
        >
          <Input.OTP variant="filled" {...sharedProps} />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default VerificationOtpPage
