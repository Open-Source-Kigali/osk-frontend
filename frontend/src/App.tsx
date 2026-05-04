import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { lazy, Suspense } from "react";
import type { ComponentType } from "react";

import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Community from "./pages/Community";
import Projectt from "./pages/Projects";
import Resources from "./pages/Resources"
import RootLayer from "./pages/RootLayer";
import Partners from "./pages/Partners";
import Event from "./pages/Event";
const MembersForm       = lazy(() => import("./pages/MembersForm"));
const PartnersForm = lazy(() => import("./pages/PartnersForm"));

const wrap = (Component: ComponentType) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Component />
  </Suspense>
);
import ErrorPage from "./pages/ErrorPage";


const router = createBrowserRouter([
  {
    path: "/",
    Component : RootLayer,
    ErrorBoundary: ErrorPage,
    children : [
      { index: true, Component: HomePage },
      {path:'/about', Component: About},
      {path:'/community', Component: Community },
      {path:'/event', Component: Event},
      {path:'/resources', Component: Resources},
      {path:'/projects', Component: Projectt},
      {path:'/partners', Component: Partners},
      { path: '/membersform', element: wrap(MembersForm) },
      { path: '/partnersform', element: wrap(PartnersForm) },
      

    ]
    
  },
]);

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App 
