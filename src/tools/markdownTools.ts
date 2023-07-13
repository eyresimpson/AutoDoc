import { Uri, workspace } from "vscode";

// 尝试读取文件第一行的名称
function getFileTitle(filePath: string) {
  const fileUri = Uri.file(filePath);
  const document = workspace.openTextDocument(fileUri);

  return new Promise<string | undefined>((resolve) => {
    document.then((doc) => {
      const lines: string[] = [];
      for (let i = 0; i < doc.lineCount; i++) {
        const line = doc.lineAt(i);
        if (line.text.startsWith("# ")) {
          const headingText = line.text.substring(2).trim();
          resolve(headingText);
          return;
        }
      }
      resolve(undefined);
    });
  });
}

// 尝试获取Markdown文档中所有的图片地址。返回一个数组<字符串>
function getImagesPath(filePath: string): Array<string> {
    console.log(filePath)
  let images: Array<string> = [];
  // 读取文件内容

  // 遍历每一行，判断是否为图片，如果是图片，就将地址加入列表

  return images;
}

export default {
  getFileTitle,
  getImagesPath,
};
