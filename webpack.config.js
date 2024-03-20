import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";

/** @type { (any) => import('webpack').Configuration } */
const config = (env) => ({
    mode: env.WEBPACK_SERVE ? "development" : "production",
    entry: "./src/renderer/renderer.tsx",
    output: {
        filename: "renderer.js",
        path: path.resolve(import.meta.dirname, "dist", "renderer"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html",
        }),
        new webpack.ProvidePlugin({
            React: "react",
        }),
    ],
    devServer: {
        static: {
            directory: path.resolve(import.meta.dirname, "public"),
        },
        compress: true,
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.(m?js|ts|tsx)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "swc-loader",
                },
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
        alias: {
            "@": path.resolve(import.meta.dirname, "src/renderer"),
            src: path.resolve(import.meta.dirname, "src"),
        },
    },
    performance: {
        hints: env.WEBPACK_SERVE ? false : "warning",
    },
});

export default config;
