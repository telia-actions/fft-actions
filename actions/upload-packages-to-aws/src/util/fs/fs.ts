import fs from 'fs';
import path from 'path';

export function copyFile(sourceFile: string, targetFile: string) {
  const targetDir = path.dirname(targetFile);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.copyFileSync(sourceFile, targetFile);
}
