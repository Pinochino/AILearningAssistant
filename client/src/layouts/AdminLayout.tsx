import React from 'react'
import { Outlet } from 'react-router-dom';

interface IAdminLayout {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: IAdminLayout) => {
    return (
        <div>{children}
            <Outlet />
        </div>
    )
}

export default AdminLayout