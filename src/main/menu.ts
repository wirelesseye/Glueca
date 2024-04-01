import {
    BrowserWindow,
    Menu,
    MenuItem,
    MenuItemConstructorOptions,
    app,
} from "electron";
import * as windows from "./windows";
import * as handlers from "./handlers";

export function buildMenu(window?: BrowserWindow) {
    const menuTemplate: Array<MenuItemConstructorOptions | MenuItem> = [];

    const isMac = process.platform === "darwin";

    if (isMac)
        menuTemplate.push({
            label: app.name,
            submenu: [
                { role: "about" },
                { type: "separator" },
                {
                    label: "Settings…",
                    accelerator: "CmdOrCtrl+,",
                    click: windows.createSettingsWindow,
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
                label: "New Scene",
                accelerator: "CmdOrCtrl+N",
                click: (_, window) => handlers.newScene(window?.webContents),
            },
            {
                label: "New Window",
                accelerator: "CmdOrCtrl+Shift+N",
                click: windows.createSceneWindow,
            },
            {
                label: "Open…",
                accelerator: "CmdOrCtrl+O",
                click: (_, window) => handlers.openScene(window?.webContents),
            },
            { type: "separator" },
            {
                label: "Close Window",
                accelerator: "Shift+CmdOrCtrl+W",
            },
            {
                label: "Close Scene",
                accelerator: "CmdOrCtrl+W",
                click: (_, window) => {
                    if (window) handlers.closeScene(window.webContents);
                },
            },
            {
                label: "Save",
                accelerator: "CmdOrCtrl+S",
                click: (_, window) => {
                    if (window) handlers.saveScene(window.webContents);
                },
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
        label: "View",
        role: "viewMenu",
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
        submenu: [
            {
                role: "minimize",
            },
            {
                role: "zoom",
            },
            {
                label: "Always on Top",
                accelerator: isMac ? "Cmd+Option+T" : "Ctrl+Alt+P",
                type: "checkbox",
                checked: window ? window.isAlwaysOnTop() : false,
                click: (_, window) => {
                    if (window) handlers.toggleAlwaysOnTop(window);
                },
            },
            {
                label: "Visible on All Workspaces",
                accelerator: "CmdOrCtrl+V",
                type: "checkbox",
                checked: window ? window.isVisibleOnAllWorkspaces() : false,
                click: (_, window) => {
                    if (window) handlers.toggleVisibleOnAllWorkspaces(window);
                },
            },
        ],
    });

    menuTemplate.push({
        label: "Help",
        role: "help",
        submenu: [{ role: "toggleDevTools" }],
    });

    return Menu.buildFromTemplate(menuTemplate);
}

export function updateMenu(window?: BrowserWindow) {
    const menu = buildMenu(window);
    Menu.setApplicationMenu(menu);
}
