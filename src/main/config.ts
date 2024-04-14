import { app } from "electron";
import path from "path";
import fs from "fs";
import YAML from "yaml";

export interface Hotkeys {
    toggleAllWindows: ""
}

export interface Config {
    hotkeys: Hotkeys
}

export interface SceneWindowState {
    x: number;
    y: number;
    width: number;
    height: number;
    alwaysOnTop: boolean;
    filePaths: string[];
}

export interface WorkspaceState {
    scenes: SceneWindowState[];
}

function getDataPath() {
    const dataPath = path.join(app.getPath("appData"), "Glueca");
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
    }
    console.log(dataPath);
    return dataPath;
}

export function readConfig() {
    const filePath = path.join(getDataPath(), "Config.yml");
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const file = fs.readFileSync(filePath, "utf-8");
    return YAML.parse(file) as Config;
}

export function writeConfig(config: Config) {
    const filePath = path.join(getDataPath(), "Config.yml");
    fs.writeFileSync(filePath, YAML.stringify(config), "utf-8");
}

export function readWorkspaceState() {
    const filePath = path.join(getDataPath(), "Workspace.yml");
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const file = fs.readFileSync(filePath, "utf-8");
    return YAML.parse(file) as WorkspaceState;
}

export function writeWorkspaceState(state: WorkspaceState) {
    const filePath = path.join(getDataPath(), "Workspace.yml");
    fs.writeFileSync(filePath, YAML.stringify(state), "utf-8");
}
