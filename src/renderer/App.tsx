import {
    Outlet,
    RouterProvider,
    createHashHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import "./styles.css";
import SettingsScreen from "./screens/SettingsScreen";
import SceneScreen from "./screens/SceneScreen";
import { useDarkTheme } from "./lib/theme";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { BodyStyleProvider } from "./components/BodyStyle";

const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren([
    createRoute({
        getParentRoute: () => rootRoute,
        path: "/",
        component: SceneScreen,
    }),
    createRoute({
        getParentRoute: () => rootRoute,
        path: "/index.html",
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
    const dark = useDarkTheme();
    const [bodyClassName, setBodyClassName] = useState("");

    useEffect(() => {
        document.body.className = (dark ? "dark " : "") + bodyClassName;
    }, [dark, bodyClassName]);

    return (
        <BodyStyleProvider
            value={{
                setBodyClassName,
            }}
        >
            <RouterProvider router={router} />
            <Toaster />
        </BodyStyleProvider>
    );
}
