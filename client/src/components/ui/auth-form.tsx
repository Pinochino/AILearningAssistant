import { Button, Checkbox, Flex, Form, Input, Typography } from "antd";
import { FormProps } from "antd/es/form/Form";
import { LoginType, RegisterType } from "../../types/UserInterface";
import { Link } from "react-router-dom";

const { Title } = Typography;

type authFormType = "login" | "register";

interface IAuthForm {
  type: authFormType;
}

const AuthForm = ({ type = "login" }: IAuthForm) => {
  const [form] = Form.useForm();

  const onFinish: FormProps<LoginType | RegisterType>["onFinish"] = (
    values
  ) => {
    console.log("Success:", values);
  };

  const onFinishFailed: FormProps<
    LoginType | RegisterType
  >["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="auth"
      // labelCol={{ span: 8 }}
      // wrapperCol={{ span: 16 }}
      style={{ minWidth: "30%", padding: 20, height: "100%" }}
      // initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      form={form}
      layout="vertical"
      className="shadow-xl"
    >
      {type === "login" ? (
        <Title className="text-center !text-3xl">Login Page</Title>
      ) : (
        <Title className="text-center !text-3xl">Register Page</Title>
      )}

      {type === "register" && (
        <Form.Item<RegisterType>
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input
            type="text"
            autoComplete="additional-name"
            placeholder="Enter your username..."
          />
        </Form.Item>
      )}

      <Form.Item<RegisterType>
        label="Email"
        name="email"
        rules={[{ required: true, message: "Please input your email!" }]}
      >
        <Input
          type="email"
          autoComplete="new-email"
          placeholder="Enter your email..."
        />
      </Form.Item>

      <Form.Item<LoginType | RegisterType>
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password
          type="password"
          placeholder="Enter your password..."
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item<LoginType>
        name="remember"
        valuePropName="checked"
        label={null}
        
      >
        <Flex justify="between" align="center" className="w-[100%] flex justify-between items-center">
          {type === 'login' &&   <Checkbox>Remember me</Checkbox>}
          <div>
            {type === "login" ? (
              <Link to={"/auth/register"}>I don't have an account</Link>
            ) : (
              <Link to={"/auth/login"}>I already have an account</Link>
            )}
          </div>
        </Flex>
      </Form.Item>

      <Form.Item label={null} className="flex justify-center ">
        <Button type="primary" htmlType="submit" className="w-[100%]">
          Submit
        </Button>
      </Form.Item>

    </Form>
  );
};
export default AuthForm;
