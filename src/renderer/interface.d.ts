export interface IElectronAPI {
    removeAllListeners: (channel: string) => void;
    quit: () => void;
    openSettings: () => void;
    newScene: () => void;
    openScene: () => void;
    onOpenScene: (callback: (filePath: string) => void) => void;
    onSaveScene: (callback: () => void) => void;
    onCloseScene: (callback: () => void) => void;
    saveFile: (filePath: string, data: Uint8Array) => Promise<void>;
    readFile: (filePath: string) => Promise<Uint8Array>;
    getAccentColor: () => Promise<string>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }

    interface ArrayBuffer {
        readonly detached: boolean;
        transfer(newLength?: number): ArrayBuffer;
        transferToFixedLength(newLength?: number): ArrayBuffer;
    }
}
