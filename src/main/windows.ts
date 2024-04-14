import { BrowserWindow, WebContents, app, ipcMain } from "electron";
import path from "path";
import { updateMenu } from "./menu";
import {
    WorkspaceState,
    readWorkspaceState,
    writeWorkspaceState,
} from "./config";

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
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        titleBarStyle: "hiddenInset",
        backgroundColor: "#00000000",
        vibrancy: "sidebar",
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

const workspaceState: WorkspaceState = { scenes: [] };

export function loadWorkspaceState() {
    const workspaceState = readWorkspaceState();
    if (workspaceState) {
        for (const sceneWindowState of workspaceState.scenes) {
            const window = createSceneWindow();
            window.setSize(sceneWindowState.width, sceneWindowState.height);
            window.setPosition(sceneWindowState.x, sceneWindowState.y);
            window.setAlwaysOnTop(sceneWindowState.alwaysOnTop, "pop-up-menu");
            window.webContents.once("dom-ready", () => {
                for (const filePath of sceneWindowState.filePaths) {
                    window.webContents.send("open-scene", filePath);
                }
            });
        }
        return true;
    } else {
        return false;
    }
}

let writeWorkspaceStateResolve: (() => void) | null = null;
const savedWebcontensIds = new Set<number>();
export function saveWorkspaceState() {
    return new Promise<void>((resolve) => {
        writeWorkspaceStateResolve = resolve;
        const windows = Object.values(sceneWindows);
        if (windows.length > 0) {
            for (const window of windows) {
                window.webContents.send("save-window-state");
            }
        } else {
            resolve();
        }
    });
}

ipcMain.on("save-file-paths", (event, filePaths: string[]) => {
    const window = sceneWindows[event.sender.id];
    workspaceState.scenes.push({
        x: window.getPosition()[0],
        y: window.getPosition()[1],
        width: window.getSize()[0],
        height: window.getSize()[1],
        alwaysOnTop: window.isAlwaysOnTop(),
        filePaths: filePaths,
    });
    savedWebcontensIds.add(event.sender.id);

    if (savedWebcontensIds.size === Object.keys(sceneWindows).length) {
        writeWorkspaceState(workspaceState);
        writeWorkspaceStateResolve!();
    }
});
