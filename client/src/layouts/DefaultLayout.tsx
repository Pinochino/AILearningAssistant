import React from "react";
import { Outlet } from "react-router-dom";

interface IDefaultLayout {
  children: React.ReactNode;
}
const DefaultLayout = ({ children }: IDefaultLayout) => {
  return (
    <div>
      {children}
      <Outlet />
    </div>
  );
};

export default DefaultLayout;
