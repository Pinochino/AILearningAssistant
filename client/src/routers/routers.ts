import React from "react";
import DefaultLayout from "../layouts/DefaultLayout";
import LoginPage from "../pages/auth/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import UserManagmentPage from "../pages/admin/UserManagmentPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/client/HomePage";
import VerificationOtpPage from "../pages/auth/VerificationOtpPage";
import NewPasswordPage from "../pages/auth/NewPasswordPage";
import ForbiddenPage from "../pages/ForbiddenPage";

export interface IRouter {
  path?: string;
  Component?: React.ElementType;
  index?: boolean;
  children?: IRouterChildren[];
  layout?: React.ElementType;
}

type IRouterChildren = Pick<IRouter, "path" | "index" | "Component">;

const publicRouter: IRouter[] = [
  {
    path: "/auth",
    layout: AuthLayout,
    children: [
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "verify-otp", Component: VerificationOtpPage },
      { path: "new-password", Component: NewPasswordPage }
    ],
  },
  {
    path: '/forbidden',
    Component: ForbiddenPage,
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
];

const privateRouter: IRouter[] = [
  {
    path: "/",
    layout: DefaultLayout,
    children: [{ index: true, Component: HomePage }],
  },
  {
    path: "/admin",
    layout: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "users", Component: UserManagmentPage },
    ],
  },
];

export { privateRouter, publicRouter };
