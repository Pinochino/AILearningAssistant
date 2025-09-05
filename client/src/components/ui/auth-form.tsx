import { Button, Form, Input, Typography } from 'antd';
import { FormProps } from 'antd/es/form/Form';
import { LoginType, RegisterType } from '../../types/UserInterface';

const { Title } = Typography;

type authFormType = 'login' | 'register'

interface IAuthForm {
    type: authFormType
}

const AuthForm = ({ type = 'login' }: IAuthForm) => {

    const [form] = Form.useForm();

    const onFinish: FormProps<LoginType | RegisterType>['onFinish'] = (values) => {
        console.log('Success:', values);
    };

    const onFinishFailed: FormProps<LoginType | RegisterType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Form
            name="auth"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            // initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            form={form}
            layout='vertical'
        >
            {type === 'login' ? <Title>Login Page</Title> : <Title>Register Page</Title>}

            {
                type === 'register' &&
                <Form.Item<RegisterType>
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input type='text' autoComplete='additional-name' placeholder='Enter your username...' />
                </Form.Item>}

            <Form.Item<RegisterType>
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Please input your email!' }]}
            >
                <Input type='email' autoComplete='new-email' placeholder='Enter your email...' />
            </Form.Item>
            <Form.Item<LoginType | RegisterType>
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password type='password' placeholder='Enter your password...' autoComplete='new-password' />
            </Form.Item>

            <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>

        </Form>
    )
}
export default AuthForm;