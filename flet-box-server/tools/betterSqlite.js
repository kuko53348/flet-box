// betterSqlite.js - SQLite wrapper for Node.js
// All methods return [status, data] where status is boolean.
// Method names in camelCase for JavaScript conventions.

/**
 * # SQLITE MODULE (camelCase version)
 * - easy way to access data
 * - easy way to handle errors in database
 * - easy way to save a lot of time making scripts
 *
 * All methods in class SQLite:
 *
 * - createTable
 * - addColumn
 * - insert
 * - renameTable
 * - renameColumn
 * - setNull
 * - update
 * - updateWhere
 * - updateMultiple
 * - dropTable
 * - clearTable
 * - delete
 * - deleteWhere
 * - checkTable
 * - getTableStructure
 * - checkColumn
 * - checkValue
 * - listTables
 * - readAll
 * - readLast
 * - readWhere
 * - readWhereMatch
 *
 * @example
 * import { SQLite } from './betterSqlite.js';
 *
 * const dataDbWrite = {
 *   userName: 'TEXT',
 *   projectTab: 'TEXT',
 *   nameProject: 'TEXT',
 *   rankingApp: 'TEXT',
 *   draggScreen: 'TEXT',
 *   appScreen: 'TEXT',
 *   timeCreated: 'TEXT',
 * };
 *
 * const dataWrite = {
 *   userName: 'javier',
 *   projectTab: 'TEXT',
 *   nameProject: 'TEXT',
 *   rankingApp: 'TEXT',
 *   draggScreen: 'TEXT',
 *   appScreen: 'TEXT',
 *   timeCreated: 'TEXT',
 * };
 *
 * const instance = new SQLite('database.db');
 *
 * // --- CREATE ---
 * // Create table
 * instance.createTable('message', dataDbWrite);
 *
 * // Add new column
 * const status1 = instance.addColumn('message', 'userNameTest', 'TEXT');
 * console.log(status1);
 *
 * // Insert data
 * const status2 = instance.insert('message', dataWrite);
 * console.log(status2);
 *
 * // --- UPDATE ---
 * // Rename table
 * const status3 = instance.renameTable('message', 'whatsapp');
 * console.log(status3);
 *
 * // Rename column
 * const status4 = instance.renameColumn('message', 'whatsapp', 'userName');
 * console.log(status4);
 *
 * // Set column to NULL
 * const status5 = instance.setNull('message', 'userName', null);
 * console.log(status5);
 *
 * // Update value where condition
 * const status6 = instance.update(
 *   'message',
 *   { userName: 'xavier' },
 *   ['userName', 'xavier53348']
 * );
 * console.log(status6);
 *
 * // Update value where + match
 * const status7 = instance.updateWhere(
 *   'message',
 *   { userName: 'xavier53348' },
 *   ['userName', 'xavier'],
 *   ['draggScreen', 'TEXT']
 * );
 * console.log(status7);
 *
 * // Update multiple columns with multiple conditions
 * const status8 = instance.updateMultiple(
 *   'widgets',
 *   { name: 'Widget Pro', price: 99.99 },
 *   [['id', 1], ['active', 1]]
 * );
 * console.log(status8);
 *
 * // --- DELETE ---
 * // Drop table
 * const status9 = instance.dropTable('message');
 * console.log(status9);
 *
 * // Clear all data from table
 * const status10 = instance.clearTable('message');
 * console.log(status10);
 *
 * // Delete rows where condition
 * const status11 = instance.delete('message', ['userName', 'xavier53348']);
 * console.log(status11);
 *
 * // Delete rows where + match
 * const status12 = instance.deleteWhere(
 *   'message',
 *   ['userName', 'javier'],
 *   ['draggScreen', 'TEXT']
 * );
 * console.log(status12);
 *
 * // --- READ ---
 * // List all tables
 * const status13 = instance.listTables();
 * console.log(status13);
 *
 * // Check if table exists
 * const status14 = instance.checkTable('whatsapp');
 * console.log(status14);
 *
 * // Get table structure
 * const status15 = instance.getTableStructure('whatsapp');
 * console.log(status15);
 *
 * // Check column existence
 * const status16 = instance.checkColumn('message', 'projectTab');
 * console.log(status16);
 *
 * // Check value existence
 * const status17 = instance.checkValue('message', 'userName', 'xavier53348');
 * console.log(status17);
 *
 * // Read last N rows
 * const status18 = instance.readLast('message', 'id', 2, false);
 * console.log(status18);
 *
 * // Read all rows
 * const status19 = instance.readAll('message', false);
 * console.log(status19);
 *
 * // Read rows where condition
 * const status20 = instance.readWhere('message', ['userName', 'TEXT'], false);
 * console.log(status20);
 *
 * // Read rows where + match
 * const status21 = instance.readWhereMatch(
 *   'message',
 *   ['userName', 'javier'],
 *   ['draggScreen', 'TEXT'],
 *   false
 * );
 * console.log(status21);
 */

import Database from "better-sqlite3";

export class SQLite {
  /**
   * @param {string} path - Path to SQLite database file (default: 'database.db')
   */
  constructor(path = "database.db") {
    this.path = path;
    this.db = null;
  }

  // ========== CONNECTION ==========

  /**
   * Opens or returns the existing database connection.
   * @returns {Database} better-sqlite3 database instance.
   */
  connect() {
    if (!this.db) {
      this.db = new Database(this.path);
    }
    return this.db;
  }

  /**
   * Closes the database connection.
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // ========== CHECK STATUS ==========

  /**
   * Checks if a table exists.
   * @param {string} tableName - Name of the table.
   * @returns {[boolean, string]} - [true, 'message'] or [false, 'error message'].
   */
  checkTable(tableName) {
    try {
      const db = this.connect();
      const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
      const result = stmt.all();
      if (result.length === 0) {
        return [false, `Table '${tableName}' does not exist.`];
      }
      return [true, `Table '${tableName}' exists.`];
    } catch (error) {
      return [false, `Error checking table: ${error.message}`];
    }
  }

  /**
   * Gets the full structure (columns) of a table.
   * @param {string} tableName - Name of the table.
   * @returns {[boolean, Array|string]} - [true, structure] or [false, error message].
   */
  getTableStructure(tableName) {
    try {
      const db = this.connect();
      const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
      const result = stmt.all();
      if (result.length === 0) {
        return [false, `Table '${tableName}' does not exist.`];
      }
      return [true, result];
    } catch (error) {
      return [false, `Error getting table structure: ${error.message}`];
    }
  }

  /**
   * Checks if a column exists in a table.
   * @param {string} tableName - Name of the table.
   * @param {string} columnName - Name of the column.
   * @returns {[boolean, string]} - [true, 'message'] or [false, 'error message'].
   */
  checkColumn(tableName, columnName) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    try {
      const db = this.connect();
      const stmt = db.prepare(`
        SELECT COUNT(*) FROM pragma_table_info(?) WHERE name = ?
      `);
      const row = stmt.get(tableName, columnName);
      if (row["COUNT(*)"] === 0) {
        return [
          false,
          `Column '${columnName}' does not exist in table '${tableName}'.`,
        ];
      }
      return [true, `Column '${columnName}' exists in table '${tableName}'.`];
    } catch (error) {
      return [false, `Error checking column: ${error.message}`];
    }
  }

  /**
   * Checks if a specific value exists in a column.
   * @param {string} tableName - Name of the table.
   * @param {string} columnName - Name of the column.
   * @param {any} value - Value to check.
   * @returns {[boolean, string]} - [true, 'message'] or [false, 'error message'].
   */
  checkValue(tableName, columnName, value) {
    const colCheck = this.checkColumn(tableName, columnName);
    if (!colCheck[0]) return colCheck;

    try {
      const db = this.connect();
      const stmt = db.prepare(
        `SELECT * FROM ${tableName} WHERE ${columnName} = ?`,
      );
      const row = stmt.get(value);
      if (!row) {
        return [false, `Value '${value}' not found in column '${columnName}'.`];
      }
      return [true, `Value '${value}' exists in column '${columnName}'.`];
    } catch (error) {
      return [false, `Error checking value: ${error.message}`];
    }
  }

  // ========= CREATE =========

  /**
   * Creates a table with given columns.
   * @param {string} tableName - Name of the table.
   * @param {Object} columns - Object with column names as keys and SQL types as values.
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  createTable(tableName, columns) {
    try {
      const db = this.connect();
      const cols = Object.entries(columns)
        .map(([name, type]) => `${name} ${type}`)
        .join(", ");
      const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${cols})`;
      db.exec(query);
      return [true, `Table '${tableName}' created successfully.`];
    } catch (error) {
      return [false, `Error creating table: ${error.message}`];
    }
  }

  /**
   * Adds a new column to an existing table.
   * @param {string} tableName - Name of the table.
   * @param {string} columnName - Name of the new column.
   * @param {string} dataType - SQL data type (default 'TEXT').
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  addColumn(tableName, columnName, dataType = "TEXT") {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    const colCheck = this.checkColumn(tableName, columnName);
    if (colCheck[0]) {
      return [
        false,
        `Column '${columnName}' already exists in '${tableName}'.`,
      ];
    }

    try {
      const db = this.connect();
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`);
      return [true, `Column '${columnName}' added to '${tableName}'.`];
    } catch (error) {
      return [false, `Error adding column: ${error.message}`];
    }
  }

  /**
   * Inserts a row of data into the table.
   * @param {string} tableName - Name of the table.
   * @param {Object} data - Object with column-value pairs to insert.
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  insert(tableName, data) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    try {
      const db = this.connect();
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => "?").join(", ");
      const stmt = db.prepare(
        `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`,
      );
      stmt.run(...values);
      return [true, `Data inserted into '${tableName}'.`];
    } catch (error) {
      return [false, `Error inserting data: ${error.message}`];
    }
  }

  // ========= UPDATE =========

  /**
   * Sets a column to NULL for all rows (or can set a specific value).
   * @param {string} tableName - Name of the table.
   * @param {string} columnName - Name of the column.
   * @param {any} value - Value to set (default null).
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  setNull(tableName, columnName, value = null) {
    const colCheck = this.checkColumn(tableName, columnName);
    if (!colCheck[0]) return colCheck;

    try {
      const db = this.connect();
      const stmt = db.prepare(`UPDATE ${tableName} SET ${columnName} = ?`);
      stmt.run(value);
      return [
        true,
        `Column '${columnName}' set to ${value} in '${tableName}'.`,
      ];
    } catch (error) {
      return [false, `Error updating column: ${error.message}`];
    }
  }

  /**
   * Renames a table.
   * @param {string} oldName - Current name of the table.
   * @param {string} newName - New name for the table.
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  renameTable(oldName, newName) {
    const tableCheck = this.checkTable(oldName);
    if (!tableCheck[0]) return tableCheck;

    try {
      const db = this.connect();
      db.exec(`ALTER TABLE ${oldName} RENAME TO ${newName}`);
      return [true, `Table '${oldName}' renamed to '${newName}'.`];
    } catch (error) {
      return [false, `Error renaming table: ${error.message}`];
    }
  }

  /**
   * Renames a column in a table.
   * @param {string} tableName - Name of the table.
   * @param {string} oldName - Current column name.
   * @param {string} newName - New column name.
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  renameColumn(tableName, oldName, newName) {
    const colCheck = this.checkColumn(tableName, oldName);
    if (!colCheck[0]) return colCheck;

    try {
      const db = this.connect();
      db.exec(
        `ALTER TABLE ${tableName} RENAME COLUMN ${oldName} TO ${newName}`,
      );
      return [true, `Column '${oldName}' renamed to '${newName}'.`];
    } catch (error) {
      return [false, `Error renaming column: ${error.message}`];
    }
  }

  /**
   * Updates a value in a specific row identified by a column-value pair.
   * @param {string} tableName - Name of the table.
   * @param {Object} data - Object with column-value pairs to update.
   * @param {[string, any]} where - Tuple [column, value] for the condition.
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  update(tableName, data, where) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    const [whereKey, whereValue] = where;

    try {
      const db = this.connect();
      const setClause = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const stmt = db.prepare(
        `UPDATE ${tableName} SET ${setClause} WHERE ${whereKey} = ?`,
      );
      stmt.run(...Object.values(data), whereValue);
      return [true, `Data updated in '${tableName}'.`];
    } catch (error) {
      return [false, `Error updating data: ${error.message}`];
    }
  }

  /**
   * Updates a value where condition and an additional match condition are met.
   * @param {string} tableName - Name of the table.
   * @param {Object} data - Object with column-value pairs to update.
   * @param {[string, any]} where - Primary condition tuple [column, value].
   * @param {[string, any]} match - Additional condition tuple [column, value].
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  updateWhere(tableName, data, where, match) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    const [whereKey, whereValue] = where;
    const [matchKey, matchValue] = match;

    try {
      const db = this.connect();
      const setClause = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const stmt = db.prepare(
        `UPDATE ${tableName} SET ${setClause} WHERE ${whereKey} = ? AND ${matchKey} = ?`,
      );
      stmt.run(...Object.values(data), whereValue, matchValue);
      return [true, `Data updated in '${tableName}' with match condition.`];
    } catch (error) {
      return [false, `Error updating data: ${error.message}`];
    }
  }

  /**
   * Updates multiple columns with multiple conditions.
   * @param {string} tableName - Name of the table.
   * @param {Object} data - Object with column-value pairs to update.
   * @param {Array<[string, any]>} where - Array of condition tuples [column, value].
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  updateMultiple(tableName, data, where) {
    try {
      const db = this.connect();
      const setClause = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const whereClause = where.map(([col]) => `${col} = ?`).join(" AND ");
      const values = [...Object.values(data), ...where.map(([, val]) => val)];
      const stmt = db.prepare(
        `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`,
      );
      stmt.run(...values);
      return [true, `Multiple data updated in '${tableName}'.`];
    } catch (error) {
      return [false, `Error updating multiple data: ${error.message}`];
    }
  }

  // ========= DELETE =========

  /**
   * Drops a table.
   * @param {string} tableName - Name of the table.
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  dropTable(tableName) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    try {
      const db = this.connect();
      db.exec(`DROP TABLE IF EXISTS ${tableName}`);
      return [true, `Table '${tableName}' dropped.`];
    } catch (error) {
      return [false, `Error dropping table: ${error.message}`];
    }
  }

  /**
   * Deletes all rows from a table.
   * @param {string} tableName - Name of the table.
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  clearTable(tableName) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    try {
      const db = this.connect();
      db.exec(`DELETE FROM ${tableName}`);
      return [true, `All data deleted from '${tableName}'.`];
    } catch (error) {
      return [false, `Error clearing table: ${error.message}`];
    }
  }

  /**
   * Deletes rows where a column matches a value.
   * @param {string} tableName - Name of the table.
   * @param {[string, any]} where - Tuple [column, value].
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  delete(tableName, where) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    const [key, value] = where;

    try {
      const db = this.connect();
      const stmt = db.prepare(`DELETE FROM ${tableName} WHERE ${key} = ?`);
      stmt.run(value);
      return [
        true,
        `Data deleted from '${tableName}' where ${key} = ${value}.`,
      ];
    } catch (error) {
      return [false, `Error deleting data: ${error.message}`];
    }
  }

  /**
   * Deletes rows where a column matches a value and additional condition.
   * @param {string} tableName - Name of the table.
   * @param {[string, any]} where - Primary condition tuple [column, value].
   * @param {[string, any]} match - Additional condition tuple [column, value].
   * @returns {[boolean, string]} - [true, 'success message'] or [false, 'error message'].
   */
  deleteWhere(tableName, where, match) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    const [whereKey, whereValue] = where;
    const [matchKey, matchValue] = match;

    try {
      const db = this.connect();
      const stmt = db.prepare(
        `DELETE FROM ${tableName} WHERE ${whereKey} = ? AND ${matchKey} = ?`,
      );
      stmt.run(whereValue, matchValue);
      return [true, `Data deleted from '${tableName}' with match condition.`];
    } catch (error) {
      return [false, `Error deleting data: ${error.message}`];
    }
  }

  // ========= READ =========

  /**
   * Returns a list of all table names in the database.
   * @returns {[boolean, Array]} - [true, table_names] or [false, error message].
   */
  listTables() {
    try {
      const db = this.connect();
      const stmt = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table'",
      );
      const rows = stmt.all();
      const tables = rows.map((row) => row.name);
      return [true, tables];
    } catch (error) {
      return [false, `Error reading tables: ${error.message}`];
    }
  }

  /**
   * Reads all rows from a table.
   * @param {string} tableName - Name of the table.
   * @param {boolean} fetchOne - If true, returns only the first row.
   * @returns {[boolean, Array|Object|string]} - [true, data] or [false, error message].
   */
  readAll(tableName, fetchOne = false) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    try {
      const db = this.connect();
      const stmt = db.prepare(`SELECT * FROM ${tableName}`);
      if (fetchOne) {
        return [true, stmt.get()];
      }
      return [true, stmt.all()];
    } catch (error) {
      return [false, `Error reading table: ${error.message}`];
    }
  }

  /**
   * Reads the last N rows from a table (ordered by a column, default rowid).
   * @param {string} tableName - Name of the table.
   * @param {string} orderBy - Column to order by (default 'rowid').
   * @param {number} limit - Number of rows to return.
   * @param {boolean} fetchOne - If true, returns only the last row.
   * @returns {[boolean, Array|Object|string]} - [true, data] or [false, error message].
   */
  readLast(tableName, orderBy = "rowid", limit = 10, fetchOne = false) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    try {
      const db = this.connect();
      const stmt = db.prepare(
        `SELECT * FROM ${tableName} ORDER BY ${orderBy} DESC LIMIT ?`,
      );
      if (fetchOne) {
        return [true, stmt.get(limit)];
      }
      return [true, stmt.all(limit)];
    } catch (error) {
      return [false, `Error reading data: ${error.message}`];
    }
  }

  /**
   * Reads rows where a column matches a value.
   * @param {string} tableName - Name of the table.
   * @param {[string, any]} where - Tuple [column, value].
   * @param {boolean} fetchOne - If true, returns only the first matching row.
   * @returns {[boolean, Array|Object|string]} - [true, data] or [false, error message].
   */
  readWhere(tableName, where, fetchOne = false) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    const [key, value] = where;

    try {
      const db = this.connect();
      const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE ${key} = ?`);
      if (fetchOne) {
        return [true, stmt.get(value)];
      }
      return [true, stmt.all(value)];
    } catch (error) {
      return [false, `Error reading data: ${error.message}`];
    }
  }

  /**
   * Reads rows where a column matches a value and another match condition.
   * @param {string} tableName - Name of the table.
   * @param {[string, any]} where - Primary condition tuple [column, value].
   * @param {[string, any]} match - Additional condition tuple [column, value].
   * @param {boolean} fetchOne - If true, returns only the first matching row.
   * @returns {[boolean, Array|Object|string]} - [true, data] or [false, error message].
   */
  readWhereMatch(tableName, where, match, fetchOne = false) {
    const tableCheck = this.checkTable(tableName);
    if (!tableCheck[0]) return tableCheck;

    const [whereKey, whereValue] = where;
    const [matchKey, matchValue] = match;

    try {
      const db = this.connect();
      const stmt = db.prepare(
        `SELECT * FROM ${tableName} WHERE ${whereKey} = ? AND ${matchKey} = ?`,
      );
      if (fetchOne) {
        return [true, stmt.get(whereValue, matchValue)];
      }
      return [true, stmt.all(whereValue, matchValue)];
    } catch (error) {
      return [false, `Error reading data: ${error.message}`];
    }
  }
}

export default SQLite;
