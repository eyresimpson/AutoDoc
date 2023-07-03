import clipboardy from "clipboardy";
const fs = require("fs");

async function saveClipboardImage(): Promise<void> {
  try {
    const imageBuffer = clipboardy.readSync()
    const filePath = `/Users/eyresimpson/Code/OpenSource/AutoDoc/src/tools/fileTools.jpg`;
    fs.writeFileSync(filePath, imageBuffer);
    console.log(`Image saved to: ${filePath}`);
  } catch (error) {
    console.error("Failed to save image:", error);
  }
}

export default {
  saveClipboardImage,
};
