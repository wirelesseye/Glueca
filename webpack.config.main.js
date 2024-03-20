import path from "path";
import RunElectronPlugin from "./scripts/RunElectronPlugin.js";

const runElectron = new RunElectronPlugin();

/** @type { (any) => import('webpack').Configuration[] } */
const config = (env) => [
    {
        mode: env.dev ? "development" : "production",
        target: ["electron-main", "es2020"],
        experiments: {
            outputModule: true,
        },
        entry: "./src/main/main.ts",
        output: {
            filename: "main.js",
            path: path.resolve(import.meta.dirname, "dist"),
        },
        watch: env.dev,
        plugins: env.dev ? [runElectron] : undefined,
        module: {
            rules: [
                {
                    test: /\.(m?js|ts)$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: "swc-loader",
                    },
                },
            ],
        },
        resolve: {
            extensions: [".js", ".ts"],
            alias: {
                src: path.resolve(import.meta.dirname, "src"),
            },
        },
    },
    {
        mode: env.dev ? "development" : "production",
        target: ["electron-preload"],
        entry: "./src/preload/preload.ts",
        output: {
            filename: "preload.js",
            path: path.resolve(import.meta.dirname, "dist"),
        },
        watch: env.dev,
        plugins: env.dev ? [runElectron] : undefined,
        module: {
            rules: [
                {
                    test: /\.(m?js|ts)$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: "swc-loader",
                    },
                },
            ],
        },
        resolve: {
            extensions: [".js", ".ts"],
        },
    },
];

export default config;
