import { Button, Checkbox, Flex, Form, Input, Typography } from 'antd'
import { FormProps } from 'antd/es/form/Form'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppDispatch } from '../../../redux/hooks'
import { LoginType, RegisterType } from '../../../types/UserInterface'
import authService from '../../../services/AuthService'
import { setAccessToken } from '../../../utils/AccessToken'

const { Title } = Typography

type authFormType = 'login' | 'register'

interface IAuthForm {
  type: authFormType
}

const AuthForm = ({ type = 'login' }: IAuthForm) => {
  const [form] = Form.useForm()
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onFinish: FormProps<LoginType | RegisterType>['onFinish'] = async (values) => {
    console.log('Success:', values)
    setLoading(true)
    try {
      if (type === 'login') {
        const result = await dispatch(authService.login(values))

        if (authService.login.fulfilled.match(result)) {
          setAccessToken(result.payload.data.accessToken)
          navigate('/', { replace: true })
        } else {
          setErr('Login fail')
        }
      } else if (type === 'register') {
        const result = await dispatch(authService.register(values))

        if (authService.register.fulfilled.match(result)) {
          setAccessToken(result.payload.data.accessToken)
          navigate('/', { replace: true })
        } else {
          setErr('Register fail')
        }
      }
    } catch (error: any) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  }

  const onFinishFailed: FormProps<LoginType | RegisterType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  if (err) {
    return <h2>Error: {err}</h2>
  }

  if (loading) {
    return <h2>This website have been loading</h2>
  }

  return (
    <Form
      name='auth'
      // labelCol={{ span: 3 }}
      wrapperCol={{ span: 24 }}
      style={{ minWidth: '30%', padding: 20, height: '100%' }}
      // initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete='off'
      form={form}
      layout='vertical'
      className='shadow-xl'
    >
      {type === 'login' ? (
        <Title className='text-center !text-3xl'>Login Page</Title>
      ) : (
        <Title className='text-center !text-3xl'>Register Page</Title>
      )}

      {type === 'register' && (
        <Form.Item<RegisterType>
          label='Username'
          name='username'
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input type='text' autoComplete='additional-name' placeholder='Enter your username...' />
        </Form.Item>
      )}

      <Form.Item<RegisterType>
        label='Email'
        name='email'
        rules={[{ required: true, message: 'Please input your email!' }]}
      >
        <Input type='email' autoComplete='new-email' placeholder='Enter your email...' />
      </Form.Item>

      <Form.Item<LoginType | RegisterType>
        label={
          type === 'login' ? (
            <div className='w-[100%] flex justify-between items-center'>
              <span>Password</span>
              <Link to={'/auth/forgot-password'}>Forgot password</Link>
            </div>
          ) : (
            'Password'
          )
        }
        name='password'
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password type='password' placeholder='Enter your password...' autoComplete='new-password' />
      </Form.Item>

      <Form.Item<LoginType> name='remember' valuePropName='checked' label={null}>
        <Flex justify='between' align='center' className='w-[100%] flex justify-between items-center'>
          {type === 'login' && <Checkbox>Remember me</Checkbox>}
          <div>
            {type === 'login' ? (
              <Link to={'/auth/register'}>I don't have an account</Link>
            ) : (
              <Link to={'/auth/login'}>I already have an account</Link>
            )}
          </div>
        </Flex>
      </Form.Item>

      <Form.Item label={null} className='flex justify-center '>
        <Button type='primary' htmlType='submit' className='w-[100%]' loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}
export default AuthForm
