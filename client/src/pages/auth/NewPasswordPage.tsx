import handleApi from '@/api/handleApi';
import { authUrls } from '@/constant/AuthUrls';
import { Button, Form, FormProps, Input } from 'antd'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';


type FieldType = {
  password: string;
  confirmPassword: string;
};

const NewPasswordPage = () => {

  const [form] = Form.useForm();
  const { state } = useLocation();
  const email = state?.email || sessionStorage.getItem('email')
  const otp = state?.otp || sessionStorage.getItem('otp')

  const [loading, setLoading] = useState<boolean>(false)
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    console.log('Success:', values);
    try {
      setLoading(true)
      const res = await handleApi({ url: authUrls.fotgotPassword, method: 'POST', data: { otp, email, password: values.password } })
      const data = await res.data;

      if (res.status < 200 || res.status > 300) {
        setErr(res.statusText)
      }

      navigate('/auth/login')
      return data;
    } catch (error: any) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  if (loading) {
    return <h2>This website have been loading</h2>
  }

  if (err) {
    return <h2>Error: {err}</h2>
  }

  return <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
    initialValues={{ remember: true }}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
    layout='vertical'
    form={form}
  >
    <Form.Item<FieldType>
      label="Password"
      name="password"
      rules={[{ required: true, message: 'Please input your password!' }]}
    >
      <Input.Password />
    </Form.Item>

    <Form.Item
      name="confirm"
      label="Confirm Password"
      dependencies={['password']}
      hasFeedback
      rules={[
        {
          required: true,
          message: 'Please confirm your password!',
        },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('The new password that you entered do not match!'));
          },
        }),
      ]}
    >
      <Input.Password />
    </Form.Item>

    <Form.Item label={null}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </Form>
}

export default NewPasswordPage
