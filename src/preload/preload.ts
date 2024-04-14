import { contextBridge, ipcRenderer } from "electron";
import type { IElectronAPI } from "src/interface";

const api: IElectronAPI = {
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    quit: () => ipcRenderer.send("quit"),
    openSettings: () => ipcRenderer.send("open-settings"),
    newScene: () => ipcRenderer.send("new-scene"),
    openScene: () => ipcRenderer.send("open-scene"),
    onOpenScene: (callback) =>
        ipcRenderer.on("open-scene", (_event, value) => callback(value)),
    onSaveScene: (callback) => ipcRenderer.on("save-scene", () => callback()),
    onCloseScene: (callback) => ipcRenderer.on("close-scene", () => callback()),
    saveFile: (filePath, data) =>
        ipcRenderer.invoke("save-file", filePath, data),
    readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
    getAccentColor: () => ipcRenderer.invoke("get-accent-color"),
    onSaveWindowState: (callback) => ipcRenderer.on("save-window-state", callback),
    saveFilePaths: (filePaths) =>
        ipcRenderer.send("save-file-paths", filePaths),
};

contextBridge.exposeInMainWorld("electronAPI", api);
