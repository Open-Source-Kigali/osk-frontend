import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { lazy, Suspense } from "react";
import Loader from "./components/UI/Loader";
import type { ComponentType } from "react";

import HomePage from "./pages/Home/HomePage";
import About from "./pages/about/About";
import Community from "./pages/community/Community";
import Project from "./pages/projects/Projects";
// import Resources from "./pages/Resources";
import RootLayer from "./pages/RootLayer";
import Partners from "./pages/Partners/Partners";
import Event from "./pages/event/Event";
import DonatePage from "./pages/donate/DonatePage";
const PartnersForm = lazy(() => import("./pages/PartnersForm"));

const wrap = (Component: ComponentType) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);
import ErrorPage from "./pages/ErrorPage";
import ProjectDetails from "./pages/project-details/ProjectDetails";

const router = createBrowserRouter([
	{
		path: "/",
		Component: RootLayer,
		ErrorBoundary: ErrorPage,
		children: [
			{ index: true, Component: HomePage },
			{ path: "/about", Component: About },
			{ path: "/community", Component: Community },
			{ path: "/event", Component: Event },
			{ path: "/events", Component: Event },
			// {path:'/resources', Component: Resources},
			{ path: "/projects", Component: Project },
			{ path: "/projects/:slug", Component: ProjectDetails },
			{ path: "/partners", Component: Partners },
			{ path: "/partnersform", element: wrap(PartnersForm) },
			{ path: "/donate", Component: DonatePage },
		],
	},
]);

const App = () => {
	return <RouterProvider router={router} />;
};

export default App;
