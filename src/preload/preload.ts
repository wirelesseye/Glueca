import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    removeAllListeners: (channel: string) =>
        ipcRenderer.removeAllListeners(channel),
    quit: () => ipcRenderer.send("quit"),
    openSettings: () => ipcRenderer.send("open-settings"),
    newScene: () => ipcRenderer.send("new-scene"),
    openScene: () => ipcRenderer.send("open-scene"),
    onOpenScene: (callback: (filePath: string) => void) =>
        ipcRenderer.on("open-scene", (_event, value) => callback(value)),
    onSaveScene: (callback: () => void) =>
        ipcRenderer.on("save-scene", () => callback()),
    onCloseScene: (callback: () => void) =>
        ipcRenderer.on("close-scene", () => callback()),
    saveFile: (filePath: string, data: Uint8Array) =>
        ipcRenderer.invoke("save-file", filePath, data),
    readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),
    getAccentColor: () => ipcRenderer.invoke("get-accent-color"),
});
