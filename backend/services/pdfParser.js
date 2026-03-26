import fs from "fs";

import { createRequire } from "module";
import DOMMatrix from "@thednp/dommatrix";

global.DOMMatrix = DOMMatrix;

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const parsePDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};
