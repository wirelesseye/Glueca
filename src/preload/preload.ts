import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    quit: () => ipcRenderer.send("quit"),
    openSettings: () => ipcRenderer.send("open-settings"),
    newScene: () => ipcRenderer.send("new-scene"),
    openScene: () => ipcRenderer.send("open-scene"),
    onOpenScene: (callback: (filePath: string) => void) =>
        ipcRenderer.on("open-scene", (_event, value) => callback(value)),
    saveFile: (filePath: string, data: Uint8Array) =>
        ipcRenderer.send("save-file", filePath, data),
    readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),
});
