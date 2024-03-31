import { BrowserWindow, WebContents, app } from "electron";
import path from "path";
import { updateMenu } from "./menu";

const __dirname = app.isPackaged
    ? path.join(process.resourcesPath, `app.asar/dist`)
    : path.join(process.cwd(), "dist");
const DEV_URL = "http://localhost:9000/";

const sceneWindows: Record<number, BrowserWindow> = {};
let settingsWindow: BrowserWindow | null = null;

export function isSceneWindow(input: BrowserWindow | WebContents) {
    if (input instanceof BrowserWindow) {
        return input.webContents.id in sceneWindows;
    } else {
        return input.id in sceneWindows;
    }
}

export const createSceneWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        titleBarStyle: "hiddenInset",
        vibrancy: "sidebar",
    });

    if (app.isPackaged) {
        window.loadFile(path.join(__dirname, `renderer/index.html`));
    } else {
        window.loadURL(DEV_URL);
    }

    sceneWindows[window.webContents.id] = window;

    window.on("focus", () => {
        updateMenu(window);
    });

    window.on("close", () => {
        delete sceneWindows[window.webContents.id];
    });

    return window;
};

export function createSettingsWindow() {
    if (settingsWindow) {
        settingsWindow.focus();
        return settingsWindow;
    }

    settingsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (app.isPackaged) {
        settingsWindow.loadFile(path.join(__dirname, `renderer/index.html`), {
            hash: "/settings",
        });
    } else {
        settingsWindow.loadURL(`${DEV_URL}#/settings`);
    }

    settingsWindow.on("focus", () => {
        updateMenu(settingsWindow ?? undefined);
    });

    settingsWindow.on("close", () => {
        settingsWindow = null;
    });

    return settingsWindow;
}
