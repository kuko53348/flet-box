// flet-box-server/core/Database.js
import { SQLite } from '../modules/betterSqlite.js';

/**
 * Defines a database
 * @param {Object} config - Database configuration
 * @param {string} config.type - Database type ('sqlite', 'postgres', 'mysql')
 * @param {string} config.path - Database path (for SQLite)
 * @param {Object} config.tables - Table definitions
 * @returns {Object} Database with access to the tables
 */
export const Database = (config) => {
    const {
        type = 'sqlite',
        path = 'database.db',
        tables = {},
    } = config;

    let connection;

    if (type === 'sqlite') {
        connection = new SQLite(path);
    } else {
        throw new Error(`Database type "${type}" not supported yet`);
    }

    // Create tables automatically
    const dbProxy = {};

    for (const [tableName, schema] of Object.entries(tables)) {
        // Create the table if it does not exist
        const [success, message] = connection.createTable(tableName, schema);
        if (!success) {
            console.warn(`⚠️ ${message}`);
        }

        // Create access to the table
        dbProxy[tableName] = {
            // Read all
            readAll: (fetchOne = false) => {
                return connection.readAll(tableName, fetchOne);
            },
            // Insert
            insert: (data) => {
                return connection.insert(tableName, data);
            },
            // Update
            update: (data, where) => {
                return connection.update(tableName, data, where);
            },
            // Delete
            delete: (where) => {
                return connection.delete(tableName, where);
            },
            // Read where
            readWhere: (where, fetchOne = false) => {
                return connection.readWhere(tableName, where, fetchOne);
            },
            // Read last
            readLast: (orderBy = 'rowid', limit = 10, fetchOne = false) => {
                return connection.readLast(tableName, orderBy, limit, fetchOne);
            },
            // Check column
            checkColumn: (columnName) => {
                return connection.checkColumn(tableName, columnName);
            },
            // Add column
            addColumn: (columnName, dataType = 'TEXT') => {
                return connection.addColumn(tableName, columnName, dataType);
            },
            // Clear table
            clear: () => {
                return connection.clearTable(tableName);
            },
            // Drop table
            drop: () => {
                return connection.dropTable(tableName);
            },
        };
    }

    // Add general methods
    dbProxy._raw = connection;
    dbProxy._tables = tables;
    dbProxy._createTable = (tableName, schema) => {
        return connection.createTable(tableName, schema);
    };
    dbProxy._listTables = () => {
        return connection.listTables();
    };

    return dbProxy;
};

export default Database;
