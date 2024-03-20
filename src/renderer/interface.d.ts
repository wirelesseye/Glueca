export interface IElectronAPI {
    quit: () => void;
    openSettings: () => void;
    newScene: () => void;
    openScene: () => void;
    onOpenScene: (callback: (filePath: string) => void) => void;
    saveFile: (filePath: string, data: Uint8Array) => void;
    readFile: (filePath: string) => Promise<Uint8Array>;
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
