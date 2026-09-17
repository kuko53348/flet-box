// tables.js - CSV/Excel module for FletBox
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import * as XLSX from 'xlsx';
import { readFile, writeFile } from 'fs/promises';

/**
 * # TABLES MODULE
 * - Read and write CSV files
 * - Read and write Excel files (XLSX)
 *
 * @example
 * import { readCSV, writeCSV, readExcel, writeExcel } from '@flet-box/tables';
 *
 * // Read CSV
 * const data = await readCSV('users.csv');
 *
 * // Write CSV
 * await writeCSV('users.csv', data);
 *
 * // Read Excel
 * const data = await readExcel('users.xlsx');
 *
 * // Write Excel
 * await writeExcel('users.xlsx', data);
 */

/**
 * Read CSV file
 * @param {string} filePath - Path to CSV file
 * @param {Object} options - CSV parse options
 * @param {boolean} options.columns - Use first row as columns (default: true)
 * @param {string} options.delimiter - Delimiter (default: ',')
 * @param {number} options.skip - Number of rows to skip
 * @returns {Promise<Array>} Parsed data
 */
export async function readCSV(filePath, options = {}) {
  const {
    columns = true,
    delimiter = ',',
    skip = 0,
  } = options;

  const content = await readFile(filePath, 'utf-8');
  
  return parse(content, {
    columns,
    delimiter,
    from: skip + 1,
    skip_empty_lines: true,
    trim: true,
  });
}

/**
 * Write CSV file
 * @param {string} filePath - Output file path
 * @param {Array} data - Data to write
 * @param {Object} options - CSV stringify options
 * @param {string} options.delimiter - Delimiter (default: ',')
 * @param {boolean} options.header - Include header (default: true)
 * @returns {Promise<void>}
 */
export async function writeCSV(filePath, data, options = {}) {
  const {
    delimiter = ',',
    header = true,
  } = options;

  const content = stringify(data, {
    delimiter,
    header,
    columns: header && data.length > 0 ? Object.keys(data[0]) : undefined,
  });

  await writeFile(filePath, content);
  console.log(`✅ CSV saved to: ${filePath}`);
}

/**
 * Read Excel file (XLSX)
 * @param {string} filePath - Path to Excel file
 * @param {Object} options - Excel read options
 * @param {number} options.sheet - Sheet index (default: 0)
 * @param {boolean} options.raw - Return raw values (default: false)
 * @returns {Promise<Array>} Parsed data
 */
export async function readExcel(filePath, options = {}) {
  const {
    sheet = 0,
    raw = false,
  } = options;

  const buffer = await readFile(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer', raw });
  const sheetName = workbook.SheetNames[sheet];
  const worksheet = workbook.Sheets[sheetName];
  
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
}

/**
 * Write Excel file (XLSX)
 * @param {string} filePath - Output file path
 * @param {Array} data - Data to write
 * @param {Object} options - Excel write options
 * @param {string} options.sheetName - Sheet name (default: 'Sheet1')
 * @returns {Promise<void>}
 */
export async function writeExcel(filePath, data, options = {}) {
  const {
    sheetName = 'Sheet1',
  } = options;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  await writeFile(filePath, buffer);
  console.log(`✅ Excel saved to: ${filePath}`);
}

/**
 * Convert CSV string to array
 * @param {string} content - CSV content
 * @param {Object} options - Parse options
 * @returns {Array}
 */
export function parseCSVString(content, options = {}) {
  const { columns = true, delimiter = ',' } = options;
  return parse(content, { columns, delimiter, skip_empty_lines: true });
}

/**
 * Convert array to CSV string
 * @param {Array} data - Data to convert
 * @param {Object} options - Stringify options
 * @returns {string}
 */
export function stringifyCSV(data, options = {}) {
  const { delimiter = ',', header = true } = options;
  return stringify(data, {
    delimiter,
    header,
    columns: header && data.length > 0 ? Object.keys(data[0]) : undefined,
  });
}

export default {
  readCSV,
  writeCSV,
  readExcel,
  writeExcel,
  parseCSVString,
  stringifyCSV,
};
