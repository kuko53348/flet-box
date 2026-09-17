// storage.js - File Storage module for FletBox
import {
  createReadStream,
  createWriteStream,
  mkdir,
  readdir,
  stat,
  unlink,
} from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * # STORAGE MODULE
 * - Upload, download, list, delete files
 * - Local file system storage
 * - Supports S3 (optional)
 *
 * @example
 * import { uploadFile, downloadFile, listFiles, deleteFile } from '@flet-box/storage';
 *
 * // Upload file
 * const fileInfo = await uploadFile('uploads', 'foto.jpg', buffer);
 *
 * // Download file
 * const file = await downloadFile('uploads/foto.jpg');
 *
 * // List files
 * const files = await listFiles('uploads');
 *
 * // Delete file
 * await deleteFile('uploads/foto.jpg');
 */

const STORAGE_PATH = process.env.STORAGE_PATH || "./storage";

/**
 * Ensures a directory exists
 * @param {string} dir - Directory path
 * @returns {Promise<void>}
 */
async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Generate a unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
function generateUniqueName(originalName) {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const uuid = randomUUID().slice(0, 8);
  return `${name}-${uuid}${ext}`;
}

/**
 * Upload a file
 * @param {string} folder - Destination folder
 * @param {string} fileName - Original filename
 * @param {Buffer} buffer - File data
 * @param {Object} options - Options
 * @param {boolean} options.keepName - Keep original name (default: false)
 * @returns {Promise<Object>} File info
 */
export async function uploadFile(folder, fileName, buffer, options = {}) {
  const { keepName = false } = options;

  const fullPath = path.join(STORAGE_PATH, folder);
  await ensureDir(fullPath);

  const finalName = keepName ? fileName : generateUniqueName(fileName);
  const filePath = path.join(fullPath, finalName);

  await createWriteStream(filePath).write(buffer);

  return {
    name: finalName,
    path: filePath,
    size: buffer.length,
    folder,
    originalName: fileName,
  };
}

/**
 * Download a file
 * @param {string} filePath - File path relative to storage
 * @returns {Promise<Buffer>} File data
 */
export async function downloadFile(filePath) {
  const fullPath = path.join(STORAGE_PATH, filePath);

  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stat = await stat(fullPath);
  if (!stat.isFile()) {
    throw new Error(`Not a file: ${filePath}`);
  }

  return createReadStream(fullPath);
}

/**
 * List files in a folder
 * @param {string} folder - Folder name
 * @param {Object} options - Options
 * @param {boolean} options.recursive - Include subfolders (default: false)
 * @returns {Promise<Array>} List of files
 */
export async function listFiles(folder, options = {}) {
  const { recursive = false } = options;

  const fullPath = path.join(STORAGE_PATH, folder);

  if (!existsSync(fullPath)) {
    return [];
  }

  const files = await readdir(fullPath);
  const result = [];

  for (const file of files) {
    const filePath = path.join(fullPath, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory() && recursive) {
      const subFiles = await listFiles(path.join(folder, file), options);
      result.push(...subFiles);
    } else if (fileStat.isFile()) {
      result.push({
        name: file,
        path: path.join(folder, file),
        size: fileStat.size,
        modified: fileStat.mtime,
      });
    }
  }

  return result;
}

/**
 * Delete a file
 * @param {string} filePath - File path relative to storage
 * @returns {Promise<boolean>}
 */
export async function deleteFile(filePath) {
  const fullPath = path.join(STORAGE_PATH, filePath);

  if (!existsSync(fullPath)) {
    return false;
  }

  await unlink(fullPath);
  return true;
}

/**
 * Get file info
 * @param {string} filePath - File path relative to storage
 * @returns {Promise<Object>} File info
 */
export async function getFileInfo(filePath) {
  const fullPath = path.join(STORAGE_PATH, filePath);

  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileStat = await stat(fullPath);
  return {
    name: path.basename(filePath),
    path: filePath,
    size: fileStat.size,
    created: fileStat.birthtime,
    modified: fileStat.mtime,
    isFile: fileStat.isFile(),
    isDirectory: fileStat.isDirectory(),
  };
}

export default {
  uploadFile,
  downloadFile,
  listFiles,
  deleteFile,
  getFileInfo,
};
