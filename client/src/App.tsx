import React from "react";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { IRouter, publicRouter } from "./routers/routers";
import DefaultLayout from "./layouts/DefaultLayout";
import AuthLayout from "./layouts/AuthLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {publicRouter.map((e: IRouter, index: number) => {
          let Layout: React.ElementType = React.Fragment;

          if (e.layout === DefaultLayout) {
            Layout = DefaultLayout;
          } else if (e.layout === AuthLayout) {
            Layout = AuthLayout;
          }

          const Page = e.Component as React.ElementType;

          return (
            <Route
              key={index}
              path={e.path}
              element={<Layout>{Page ? <Page /> : <></>}</Layout>}
            >
              {e.children &&
                e.children.map((child, k: number) => {
                  const ChildPage = child.Component as React.ElementType;
                  return (
                    <Route
                      key={k}
                      path={child.path}
                      index={child.index as boolean}
                      element={<ChildPage />}
                    />
                  );
                })}
            </Route>
          );
        })}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
