import React from "react";
import { Outlet } from "react-router-dom";

interface IAuthLayout {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayout) => {
  return (
    <div>
      {children}
      <Outlet />
    </div>
  );
};

export default AuthLayout;
