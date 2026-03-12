import fs from "node:fs/promises";
import path from "node:path";

import { ensureDirectory } from "../filesystem/fs.js";

export async function emitReport(content, io, outputPath, cwd) {
  io.stdout.write(content);

  if (!outputPath) {
    return;
  }

  const absolutePath = path.resolve(cwd, outputPath);
  await ensureDirectory(path.dirname(absolutePath));
  await fs.writeFile(absolutePath, content, "utf8");
}
