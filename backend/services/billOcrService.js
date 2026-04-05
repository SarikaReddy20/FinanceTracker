import { createWorker } from "tesseract.js";

let workerPromise;

const getWorker = async () => {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker("eng");
      return worker;
    })();
  }

  return workerPromise;
};

export const extractBillText = async (filePath) => {
  const worker = await getWorker();
  const result = await worker.recognize(filePath);
  return result.data.text || "";
};
