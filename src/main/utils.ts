import fs from "fs";
import path from "path";

export function generateFileName(folderPath: string) {
    const baseFileName = "New Scene.gluca";

    let fileName = baseFileName;
    let counter = 1;

    // Check if the file exists, if yes, increment counter
    while (fs.existsSync(path.join(folderPath, fileName))) {
        fileName = `New Scene (${counter}).gluca`;
        counter++;
    }

    return fileName;
}
