interface KeyboardLayoutMap {
    get: (code: string) => string;
}

interface NavigatorKeyboard {
    getLayoutMap: () => Promise<KeyboardLayoutMap>;
}

interface NavigatorExt {
    readonly keyboard: NavigatorKeyboard;
}

interface Navigator extends NavigatorExt {}
