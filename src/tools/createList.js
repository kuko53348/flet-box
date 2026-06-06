// src/components/flet-box/tools/createList.js

import { random } from './random.js';

/**
 * Creates a list of items with generated data
 * @module tools/createList
 */

/**
 * Create a list of items from a schema
 * @param {Object} schema - Data schema { field: value or function(item, index) }
 * @param {number} count - Number of items to generate (default: 10)
 * @returns {Array} Generated list
 * 
 * @example
 * // Basic usage
 * const users = createList({
 *   id: () => random.id(),
 *   name: random.fullName(),
 *   age: () => random.number(18, 65),
 *   active: random.boolean()
 * }, 100);
 * 
 * @example
 * // With field dependencies
 * const users = createList({
 *   name: random.fullName(),
 *   email: (item) => random.email(item.name),
 *   age: () => random.number(18, 65)
 * }, 50);
 */
export const createList = (schema, count = 10) => {
    const items = [];
    
    for (let i = 0; i < count; i++) {
        const item = {};
        
        for (const [key, value] of Object.entries(schema)) {
            if (typeof value === 'function') {
                // Pass the partially built item and index to the function
                item[key] = value(item, i);
            } else {
                item[key] = value;
            }
        }
        
        // Auto-add id if not present in schema
        if (!item.hasOwnProperty('id') && !schema.id) {
            item.id = i;
        }
        
        items.push(item);
    }
    
    return items;
};

/**
 * Create a list from existing data with transformation
 * @param {Array} data - Source data
 * @param {Object} mapper - Mapping functions { targetField: (sourceItem, index) => value }
 * @returns {Array} Transformed list
 * 
 * @example
 * const apiUsers = await fetchUsers();
 * const users = createList.fromData(apiUsers, {
 *   id: (user) => user.userId,
 *   name: (user) => `${user.firstName} ${user.lastName}`,
 *   email: (user) => user.emailAddress
 * });
 */
createList.fromData = (data, mapper) => {
    return data.map((item, index) => {
        const result = {};
        for (const [key, transform] of Object.entries(mapper)) {
            result[key] = typeof transform === 'function' ? transform(item, index) : transform;
        }
        return result;
    });
};

/**
 * Create a sequential list of numbers
 * @param {number} start - Start value (inclusive)
 * @param {number} end - End value (inclusive)
 * @param {Function} mapper - Optional mapping function (receives value, index)
 * @returns {Array} Sequential list
 * 
 * @example
 * createList.range(1, 10) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * createList.range(0, 5, (i) => `Item ${i}`) // ['Item 0', 'Item 1', ...]
 */
createList.range = (start, end, mapper = null) => {
    const items = [];
    for (let i = start; i <= end; i++) {
        items.push(mapper ? mapper(i, i - start) : i);
    }
    return items;
};

/**
 * Create a list with repeated value
 * @param {any} value - Value to repeat
 * @param {number} count - Number of repetitions
 * @returns {Array} Repeated list
 * 
 * @example
 * createList.repeat({ active: true }, 10) // 10 objects with { active: true }
 */
createList.repeat = (value, count) => {
    return Array(count).fill(value);
};

/**
 * Paginate a list
 * @param {Array} list - Source list
 * @param {number} page - Page number (1-indexed, default: 1)
 * @param {number} pageSize - Items per page (default: 20)
 * @returns {Object} Paginated result with metadata
 * 
 * @example
 * const { data, totalPages, hasNext } = createList.paginate(users, 2, 50);
 */
createList.paginate = (list, page = 1, pageSize = 20) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
        data: list.slice(start, end),
        page,
        pageSize,
        total: list.length,
        totalPages: Math.ceil(list.length / pageSize),
        hasNext: end < list.length,
        hasPrev: page > 1,
        startIndex: start,
        endIndex: Math.min(end, list.length)
    };
};

/**
 * Search/filter a list
 * @param {Array} list - Source list
 * @param {string|Function} query - Search string or filter function
 * @param {string[]} fields - Fields to search (if query is string)
 * @returns {Array} Filtered list
 * 
 * @example
 * createList.search(users, 'Ana', ['name', 'email'])
 * createList.search(users, (user) => user.age > 30)
 */
createList.search = (list, query, fields = null) => {
    if (typeof query === 'function') {
        return list.filter(query);
    }
    
    const searchTerm = query.toLowerCase();
    return list.filter(item => {
        const searchableFields = fields || Object.keys(item);
        return searchableFields.some(field => {
            const value = item[field];
            return value && String(value).toLowerCase().includes(searchTerm);
        });
    });
};

/**
 * Sort a list
 * @param {Array} list - Source list
 * @param {string} field - Field to sort by
 * @param {string} order - 'asc' or 'desc' (default: 'asc')
 * @returns {Array} Sorted list
 */
createList.sort = (list, field, order = 'asc') => {
    const sorted = [...list];
    sorted.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return order === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (order === 'asc') {
            return aStr.localeCompare(bStr);
        } else {
            return bStr.localeCompare(aStr);
        }
    });
    return sorted;
};

/**
 * Group a list by a field
 * @param {Array} list - Source list
 * @param {string} field - Field to group by
 * @returns {Object} Grouped object
 * 
 * @example
 * const byStatus = createList.groupBy(users, 'status')
 */
createList.groupBy = (list, field) => {
    return list.reduce((groups, item) => {
        const key = item[field];
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
    }, {});
};

export default createList;
