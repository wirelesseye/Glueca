/** @type {import("prettier").Config} */
const config = {
    tabWidth: 4,
    plugins: [
        "prettier-plugin-tailwindcss",
        "prettier-plugin-classnames",
        "prettier-plugin-merge",
    ],
    customFunctions: ["cn"],
};

export default config;
