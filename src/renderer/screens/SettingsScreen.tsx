import CustomTitleBar from "@/components/CustomTitleBar";
import { Button } from "@/components/ui/button";
import { HotkeyInput } from "@/components/ui/hotkey-input";
import { Separator } from "@/components/ui/separator";
import { KeyboardIcon } from "lucide-react";

export default function SettingsScreen() {
    return (
        <div className="flex h-full flex-col">
            <CustomTitleBar />
            <div className="flex grow">
                <div className="flex w-52 flex-col p-3 pt-[40px]">
                    <Button
                        className="justify-start gap-3 bg-foreground/10"
                        variant="ghost"
                    >
                        <KeyboardIcon size={20} />
                        Shortcuts
                    </Button>
                </div>
                <Separator orientation="vertical" />
                <div className="flex flex-col grow bg-background px-3">
                    <div className="m-2 mt-[20px] font-bold text-lg">Shortcuts</div>
                    <div className="flex items-center justify-between p-2">
                        <div className="">Toggle all windows</div>
                        <HotkeyInput className="w-30" />
                    </div>
                </div>
            </div>
        </div>
    );
}
