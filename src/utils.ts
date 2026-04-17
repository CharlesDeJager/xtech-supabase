import * as fs from "fs";
import * as path from "path";
import { getSettings } from "./settings";
import { Logger } from "./logger";

const getTempDirectory = async (logger: Logger) => {
  try {
    const tempDir = getSettings().tempDirectory;
    if (tempDir && !fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true, mode: 0o777 });
    }
    logger.debug(`Using temp directory: ${tempDir}`);
    return tempDir;
  } catch (err) {
    logger.error("Error creating temp directory:", err);
    throw err;
  }
};

export async function deleteTempFile(
  filePath: string,
  logger: Logger,
): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`Deleted temporary file: ${filePath}`);
    } else {
      logger.warn(`Temporary file not found for deletion: ${filePath}`);
    }
  } catch (err) {
    logger.error(`Error deleting temporary file (${filePath}):`, err);
  }
}

export async function writeJSONLines(
  filePath: string,
  data: unknown[],
  logger: Logger,
): Promise<string> {
  try {
    const tempDir = await getTempDirectory(logger);
    logger.debug(
      `Writing JSON Lines to: ${tempDir ? path.resolve(tempDir, filePath) : filePath}`,
    );
    if (!tempDir) {
      throw new Error("Temp directory is not defined");
    }
    const outPath = path.resolve(tempDir, filePath);
    const jsonLines = data.map((item) => JSON.stringify(item)).join("\n");
    fs.writeFileSync(outPath, jsonLines, {
      encoding: "utf-8",
      mode: 0o666,
      flag: "w",
    });
    return Promise.resolve(outPath);
  } catch (err) {
    return Promise.reject(err);
  }
}

export function readJSONLines(filePath: string): unknown[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return content
    .split("\n")
    .filter((line: string) => line.trim() !== "")
    .map((line: string) => JSON.parse(line));
}
