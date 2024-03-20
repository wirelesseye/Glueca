import { spawn } from "child_process";

const pluginName = "RunElectronPlugin";

let electronProcess = null;

export default class RunElectronPlugin {
    /**
     * @param {import("webpack").Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.afterEmit.tap("AfterEmitPlugin", (compilation) => {
            if (electronProcess) {
                electronProcess.kill();
            }
            electronProcess = spawn("pnpm", ["exec", "electron", "."], {
                stdio: "inherit",
            });
            electronProcess.on("exit", (_, signal) => {
                if (compiler.watching && signal === null) {
                    process.exit();
                }
            });
        });
    }
}
