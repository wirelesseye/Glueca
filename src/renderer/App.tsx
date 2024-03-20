import {
    Outlet,
    RouterProvider,
    createHashHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import "./styles.css";
import WelcomeScreen from "./screens/WelcomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SceneScreen from "./screens/SceneScreen";
import { Global, css } from "@emotion/react";
import { colors } from "./lib/theme";

const globalStyles = css`
    @media (prefers-color-scheme: dark) {
        body {
            color: ${colors.background};
        }
    }

    @media (prefers-color-scheme: light) {
        body {
            color: ${colors.foreground};
        }
    }
`;

const rootRoute = createRootRoute({
    component: () => (
        <>
            <Global styles={globalStyles} />
            <Outlet />
        </>
    ),
});

const routeTree = rootRoute.addChildren([
    createRoute({
        getParentRoute: () => rootRoute,
        path: "/",
        component: WelcomeScreen,
    }),
    createRoute({
        getParentRoute: () => rootRoute,
        path: "/index.html",
        component: WelcomeScreen,
    }),
    createRoute({
        getParentRoute: () => rootRoute,
        path: "/scene",
        component: SceneScreen,
    }),
    createRoute({
        getParentRoute: () => rootRoute,
        path: "/settings",
        component: SettingsScreen,
    }),
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

export default function App() {
    return <RouterProvider router={router} />;
}
