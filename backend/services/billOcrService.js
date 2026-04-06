import fs from "fs/promises";
import os from "os";
import path from "path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

let workerPromise;

const getWorker = async () => {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker("eng");
      await worker.setParameters({
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: "1",
      });
      return worker;
    })();
  }

  return workerPromise;
};

const createThresholdImage = async (filePath) => {
  const tempPath = path.join(os.tmpdir(), `spendsmart-bill-threshold-${Date.now()}.png`);

  await sharp(filePath)
    .rotate()
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: 1800, fit: "inside", withoutEnlargement: false })
    .threshold(172)
    .png()
    .toFile(tempPath);

  return tempPath;
};

const createModulatedImage = async (filePath) => {
  const tempPath = path.join(os.tmpdir(), `spendsmart-bill-modulated-${Date.now()}.png`);

  await sharp(filePath)
    .rotate()
    .grayscale()
    .modulate({ brightness: 1.15 })
    .linear(1.25, -20)
    .resize({ width: 2000, fit: "inside", withoutEnlargement: false })
    .sharpen()
    .png()
    .toFile(tempPath);

  return tempPath;
};

const scoreText = (text) => {
  const normalized = (text || "").trim();
  const alphaCount = (normalized.match(/[A-Za-z]/g) || []).length;
  const digitCount = (normalized.match(/\d/g) || []).length;
  const lineCount = normalized.split("\n").filter(Boolean).length;
  const keywordCount = (
    normalized.match(/\b(invoice|bill|date|time|amount|total|cash|shop|gstin)\b/gi) || []
  ).length;
  const decimalCount = (normalized.match(/\b\d+\.\d{2}\b/g) || []).length;
  return normalized.length + alphaCount * 2 + digitCount * 3 + lineCount * 8 + keywordCount * 18 + decimalCount * 12;
};

export const extractBillText = async (filePath) => {
  const worker = await getWorker();
  const thresholdPath = await createThresholdImage(filePath);
  const modulatedPath = await createModulatedImage(filePath);

  try {
    const [originalResult, thresholdResult, modulatedResult] = await Promise.all([
      worker.recognize(filePath),
      worker.recognize(thresholdPath),
      worker.recognize(modulatedPath),
    ]);

    const candidates = [
      originalResult.data.text || "",
      thresholdResult.data.text || "",
      modulatedResult.data.text || "",
    ];

    return candidates.sort((left, right) => scoreText(right) - scoreText(left))[0];
  } finally {
    await Promise.all([
      fs.unlink(thresholdPath).catch(() => {}),
      fs.unlink(modulatedPath).catch(() => {}),
    ]);
  }
};
