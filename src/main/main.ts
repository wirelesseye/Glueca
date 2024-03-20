import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    IpcMainEvent,
    Menu,
    MenuItem,
    MenuItemConstructorOptions,
    WebContents,
} from "electron";
import process from "process";
import path from "path";
import fs from "fs";
import { generateFileName } from "./utils";
import { Scene } from "src/scene";

const __dirname = app.isPackaged
    ? path.join(process.resourcesPath, `app.asar/dist`)
    : path.join(process.cwd(), "dist");
const DEV_URL = "http://localhost:9000/";

let welcomeWindow: BrowserWindow | null = null;
const sceneWindows: Record<number, BrowserWindow> = {};

const createWelcomeWindow = () => {
    welcomeWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        titleBarStyle: "hiddenInset",
        vibrancy: "sidebar",
    });

    if (app.isPackaged) {
        welcomeWindow.loadFile(path.join(__dirname, `renderer/index.html`));
    } else {
        welcomeWindow.loadURL(DEV_URL);
    }

    welcomeWindow.on("close", () => {
        welcomeWindow = null;
    });
};

function createSceneWindow() {
    const sceneWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        titleBarStyle: "hiddenInset",
        vibrancy: "sidebar",
    });

    if (app.isPackaged) {
        sceneWindow.loadFile(path.join(__dirname, `renderer/index.html`), {
            hash: "/scene",
        });
    } else {
        sceneWindow.loadURL(`${DEV_URL}#/scene`);
    }

    sceneWindows[sceneWindow.id] = sceneWindow;

    sceneWindow.on("close", () => {
        delete sceneWindows[sceneWindow.id];
    });

    return sceneWindow;
}

function createSettingsWindow() {
    const settingsWindow = new BrowserWindow({
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
}

function openSceneByPaths(filePaths: string[], target?: WebContents) {
    if (target && target.id in sceneWindows) {
        for (const filePath of filePaths) {
            target.send("open-scene", filePath);
        }
    } else {
        const window = createSceneWindow();
        window.webContents.once("dom-ready", () => {
            for (const filePath of filePaths) {
                window.webContents.send("open-scene", filePath);
            }
        });
    }
    if (welcomeWindow !== null) {
        welcomeWindow.close();
    }
}

async function openScene(target?: WebContents) {
    const result = await dialog.showOpenDialog({
        defaultPath: path.join(app.getPath("documents"), "Glueca"),
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Glueca Scene File", extensions: ["gluca"] }],
    });

    if (!result.canceled) {
        openSceneByPaths(result.filePaths, target);
    }
}

function registerIPCHandlers() {
    ipcMain.on("quit", () => {
        app.quit();
    });

    ipcMain.on("open-settings", createSettingsWindow);

    ipcMain.on("new-scene", async (event) => {
        const folderPath = path.join(app.getPath("documents"), "Glueca");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        const fileName = generateFileName(folderPath);
        const filePath = path.join(folderPath, fileName);
        const fileData = await Scene.default().serialize();
        fs.writeFileSync(filePath, fileData);
        openSceneByPaths([filePath], event.sender);
    });

    ipcMain.on("open-scene", async (event: IpcMainEvent) =>
        openScene(event.sender),
    );

    ipcMain.on("save-file", (_event, filePath: string, data: Uint8Array) => {
        fs.writeFileSync(filePath, data);
    });

    ipcMain.handle("read-file", (_event, filePath: string): Uint8Array => {
        const file = fs.readFileSync(filePath);
        return file;
    });
}

const isMac = process.platform === "darwin";

const menuTemplate: Array<MenuItemConstructorOptions | MenuItem> = [];
if (isMac)
    menuTemplate.push({
        label: app.name,
        submenu: [
            { role: "about" },
            { type: "separator" },
            {
                label: "Settings…",
                accelerator: "CmdOrCtrl+,",
                click: createSettingsWindow,
            },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
        ],
    });

menuTemplate.push({
    label: "File",
    submenu: [
        {
            label: "New Tab",
            accelerator: "CmdOrCtrl+T",
        },
        {
            label: "New Window",
            accelerator: "CmdOrCtrl+N",
        },
        {
            label: "Open…",
            accelerator: "CmdOrCtrl+O",
            click: (_, window) => openScene(window?.webContents),
        },
        { type: "separator" },
        {
            label: "Close Window",
            accelerator: "Shift+CmdOrCtrl+W",
        },
        {
            label: "Close Tab",
            accelerator: "CmdOrCtrl+W",
        },
        {
            label: "Save",
            accelerator: "CmdOrCtrl+S",
        },
        {
            label: "Duplicate",
            accelerator: "Shift+CmdOrCtrl+S",
        },
        {
            label: "Rename",
        },
        {
            label: "Move to…",
        },
    ],
});

menuTemplate.push({
    label: "Edit",
    role: "editMenu",
});

menuTemplate.push({
    label: "Object",
    submenu: [
        {
            label: "Import…",
            accelerator: "CmdOrCtrl+I",
            enabled: false,
        },
    ],
});

menuTemplate.push({
    label: "Window",
    role: "windowMenu",
});

menuTemplate.push({
    label: "Help",
    role: "help",
    submenu: [{ role: "toggleDevTools" }],
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    registerIPCHandlers();
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    createWelcomeWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWelcomeWindow();
    }
});
