import {
    BrowserWindow,
    IpcMainEvent,
    WebContents,
    app,
    dialog,
    ipcMain,
    systemPreferences,
} from "electron";
import * as windows from "./windows";
import path from "path";
import fs from "fs";
import { generateFileName } from "./utils";
import { Scene } from "src/scene";

export function openSceneByPaths(filePaths: string[], target?: WebContents) {
    if (target && windows.isSceneWindow(target)) {
        for (const filePath of filePaths) {
            target.send("open-scene", filePath);
        }
    } else {
        const window = windows.createSceneWindow();
        window.webContents.once("dom-ready", () => {
            for (const filePath of filePaths) {
                window.webContents.send("open-scene", filePath);
            }
        });
    }
}

export async function openScene(target?: WebContents) {
    const result = await dialog.showOpenDialog({
        defaultPath: path.join(app.getPath("documents"), "Glueca"),
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Glueca Scene File", extensions: ["glueca"] }],
    });

    if (!result.canceled) {
        openSceneByPaths(result.filePaths, target);
    }
}

export async function newScene(target?: WebContents) {
    const folderPath = path.join(app.getPath("documents"), "Glueca");
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
    const fileName = generateFileName(folderPath);
    const filePath = path.join(folderPath, fileName);
    const fileData = await Scene.create().serialize();
    fs.writeFileSync(filePath, fileData);
    openSceneByPaths([filePath], target);
}

export function saveScene(target: WebContents) {
    target.send("save-scene");
}

export function toggleAlwaysOnTop(window: BrowserWindow) {
    window.setAlwaysOnTop(!window.isAlwaysOnTop(), "floating");
}

export function toggleVisibleOnAllWorkspaces(window: BrowserWindow) {
    window.setVisibleOnAllWorkspaces(!window.isVisibleOnAllWorkspaces());
}

export function registerIPCHandlers() {
    ipcMain.on("quit", () => {
        app.quit();
    });

    ipcMain.on("open-settings", windows.createSettingsWindow);

    ipcMain.on("new-scene", async (event) => newScene(event.sender));

    ipcMain.on("open-scene", async (event: IpcMainEvent) =>
        openScene(event.sender),
    );

    ipcMain.handle("save-file", (_event, filePath: string, data: Uint8Array) => {
        fs.writeFileSync(filePath, data);
    });

    ipcMain.handle("read-file", (_event, filePath: string): Uint8Array => {
        const file = fs.readFileSync(filePath);
        return file;
    });

    ipcMain.handle("get-accent-color", () => {
        return "#" + systemPreferences.getAccentColor().substring(0, 6);
    });
}
