import React from "react";
import DefaultLayout from "../layouts/DefaultLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";

export interface IRouter {
    path?: string;
    Component?: React.ElementType;
    index?: boolean;
    children?: IRouterChildren[];
    layout?: React.ElementType ;
}

type IRouterChildren = Pick<IRouter, 'path' | 'index' | 'Component'>

const publicRouter: IRouter[] = [
    {
        path: '/',
        layout: DefaultLayout,
        children: [
            { index: true,  Component: HomePage }
        ]
    },
    {
        path: '/auth',
        layout: DefaultLayout,
        children: [
            { path: 'login', Component: LoginPage }
        ]
    },
    {
        path: '*',
        Component: NotFoundPage,
    }
]

const privateRouter = [
    {

    }
]

export { privateRouter, publicRouter };