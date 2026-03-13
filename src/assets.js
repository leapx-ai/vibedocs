import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SRC_DIR, "..");

export const rootDir = ROOT_DIR;
export const scaffoldDocsDir = path.join(ROOT_DIR, "scaffold", "docs");
export const templatesDir = path.join(ROOT_DIR, "templates");
export const guidesDir = path.join(ROOT_DIR, "guides");
