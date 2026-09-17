// flet-box-server/core/Database.js
import { SQLite } from '../modules/betterSqlite.js';

/**
 * Define una base de datos
 * @param {Object} config - Configuración de la base de datos
 * @param {string} config.type - Tipo de base de datos ('sqlite', 'postgres', 'mysql')
 * @param {string} config.path - Ruta de la base de datos (para SQLite)
 * @param {Object} config.tables - Definición de tablas
 * @returns {Object} Base de datos con acceso a las tablas
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

    // Crear tablas automáticamente
    const dbProxy = {};

    for (const [tableName, schema] of Object.entries(tables)) {
        // Crear tabla si no existe
        const [success, message] = connection.createTable(tableName, schema);
        if (!success) {
            console.warn(`⚠️ ${message}`);
        }

        // Crear acceso a la tabla
        dbProxy[tableName] = {
            // Leer todos
            readAll: (fetchOne = false) => {
                return connection.readAll(tableName, fetchOne);
            },
            // Insertar
            insert: (data) => {
                return connection.insert(tableName, data);
            },
            // Actualizar
            update: (data, where) => {
                return connection.update(tableName, data, where);
            },
            // Eliminar
            delete: (where) => {
                return connection.delete(tableName, where);
            },
            // Leer donde
            readWhere: (where, fetchOne = false) => {
                return connection.readWhere(tableName, where, fetchOne);
            },
            // Leer último
            readLast: (orderBy = 'rowid', limit = 10, fetchOne = false) => {
                return connection.readLast(tableName, orderBy, limit, fetchOne);
            },
            // Verificar columna
            checkColumn: (columnName) => {
                return connection.checkColumn(tableName, columnName);
            },
            // Agregar columna
            addColumn: (columnName, dataType = 'TEXT') => {
                return connection.addColumn(tableName, columnName, dataType);
            },
            // Limpiar tabla
            clear: () => {
                return connection.clearTable(tableName);
            },
            // Eliminar tabla
            drop: () => {
                return connection.dropTable(tableName);
            },
        };
    }

    // Añadir métodos generales
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
