import DatauriParser from "datauri/parser.js";
import path from "path";

const parser = new DatauriParser();

/**
 * Builds a Data URI from a binary buffer.
 *
 * @param {Buffer} buffer - File data as a binary buffer.
 * @param {string} [fileName] - Optional original file name to determine extension.
 * @returns {string} - Data URI string (e.g. "data:image/png;base64,...").
 */
export const dataUriFromBuffer = (buffer: Buffer, fileName?: string): string => {
  const ext = (fileName && path.extname(fileName)) || ".bin";
  return parser.format(ext, buffer).content as string;
};
