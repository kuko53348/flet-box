/**
 * @file random.js
 * Faker-style random data generators for prototyping and testing.
 *
 * All generators are grouped under the `random` namespace object.
 * Functions that accept no arguments choose sensible defaults so you can
 * call them without configuration for quick mocks.
 *
 * Important: the `firstNames` and `lastNames` arrays are intentionally
 * Spanish-language sample data — they are runtime content, not developer
 * comments, and are left unchanged.
 *
 * @module tools/random
 */

// ========== BASE DATA ==========
// Sample name pools used by firstName / lastName / fullName / email generators.
const firstNames = [
  "Ana",
  "Juan",
  "María",
  "Carlos",
  "Laura",
  "Pedro",
  "Sofía",
  "Luis",
  "Elena",
  "Miguel",
  "Carmen",
  "José",
  "Isabel",
  "Francisco",
  "Marta",
  "David",
  "Lucía",
  "Javier",
  "Paula",
  "Daniel",
];

const lastNames = [
  "García",
  "Pérez",
  "López",
  "Martínez",
  "Sánchez",
  "Rodríguez",
  "Fernández",
  "González",
  "Díaz",
  "Moreno",
  "Jiménez",
  "Ruiz",
  "Hernández",
  "Álvarez",
  "Romero",
  "Navarro",
  "Torres",
  "Domínguez",
];

const domains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "protonmail.com",
  "example.com",
  "mail.com",
];

// Helper to pad numbers with leading zeros
const pad = (num, length = 2) => String(num).padStart(length, "0");

export const random = {
  // ========== NUMBERS ==========
  /**
   * Generate a random number between min and max (inclusive)
   * @param {number} min - Minimum value (default: 0)
   * @param {number} max - Maximum value (default: 100)
   * @returns {number}
   */
  number: (min = 0, max = 100) =>
    Math.floor(Math.random() * (max - min + 1)) + min,

  // ========== STRINGS ==========
  /**
   * Generate a random string of specified length
   * @param {number} length - Length of the string (default: 8)
   * @returns {string}
   */
  string: (length = 8) =>
    Math.random()
      .toString(36)
      .substring(2, 2 + length),

  // ========== NAMES ==========
  /**
   * Random first name
   * @returns {string}
   */
  firstName: () => firstNames[Math.floor(Math.random() * firstNames.length)],

  /**
   * Random last name
   * @returns {string}
   */
  lastName: () => lastNames[Math.floor(Math.random() * lastNames.length)],

  /**
   * Random full name
   * @returns {string} Example: "Juan Pérez"
   */
  fullName: () => `${random.firstName()} ${random.lastName()}`,

  /**
   * Generate random email from name
   * @param {string} name - Optional name (if not provided, generates one)
   * @returns {string} Example: "juan.perez123@gmail.com"
   */
  email: (name = null) => {
    const fullName = name || random.fullName();

    let base = fullName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, ".");

    base = base.replace(/\.+/g, ".");

    const code = random.number(100, 999);
    const domain = domains[Math.floor(Math.random() * domains.length)];

    return `${base}${code}@${domain}`;
  },

  // ========== DATES & TIMES ==========
  /**
   * Generate a random date between two dates
   * @param {Date|string} start - Start date (default: 1 year ago)
   * @param {Date|string} end - End date (default: today)
   * @returns {Date}
   */
  date: (start = null, end = null) => {
    const startDate = start ? new Date(start) : new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const endDate = end ? new Date(end) : new Date();

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);

    return new Date(randomTime);
  },

  /**
   * Generate a random date as ISO string
   * @param {Date|string} start - Start date (default: 1 year ago)
   * @param {Date|string} end - End date (default: today)
   * @returns {string} ISO format: "2024-01-15"
   */
  dateString: (start = null, end = null) => {
    const date = random.date(start, end);
    return date.toISOString().split("T")[0];
  },

  /**
   * Generate a random time (HH:MM:SS)
   * @returns {string} Example: "14:32:18"
   */
  time: () => {
    const hours = random.number(0, 23);
    const minutes = random.number(0, 59);
    const seconds = random.number(0, 59);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  },

  /**
   * Generate a random time with AM/PM format
   * @returns {string} Example: "02:32:18 PM"
   */
  timeAmPm: () => {
    let hours = random.number(0, 23);
    const minutes = random.number(0, 59);
    const seconds = random.number(0, 59);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
  },

  /**
   * Generate a random datetime (ISO string)
   * @returns {string} Example: "2024-01-15T14:32:18.123Z"
   */
  datetime: () => {
    const date = random.date();
    return date.toISOString();
  },

  /**
   * Generate a random timestamp (Unix timestamp in milliseconds)
   * @returns {number}
   */
  timestamp: () => random.date().getTime(),

  /**
   * Generate a random day of week
   * @returns {string} Monday, Tuesday, etc.
   */
  dayOfWeek: () => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return random.choice(days);
  },

  /**
   * Generate a random month
   * @returns {string} January, February, etc.
   */
  month: () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return random.choice(months);
  },

  // ========== OTHER UTILITIES ==========
  /**
   * Random age between 18 and 65
   * @returns {number}
   */
  age: () => random.number(18, 65),

  /**
   * Random boolean (true/false)
   * @returns {boolean}
   */
  boolean: () => Math.random() > 0.5,

  /**
   * Pick a random element from an array
   * @param {Array} array - The array to pick from
   * @returns {*}
   */
  choice: (array) => array[Math.floor(Math.random() * array.length)],

  /**
   * Generate a random ID (8-10 characters)
   * @returns {string}
   */
  id: () => Math.random().toString(36).substring(2, 10),

  /**
   * Generate a random hex color
   * @returns {string} Example: "#3a7bd5"
   */
  hexColor: () => {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  },

  /**
   * Generate a random RGB color
   * @returns {string} Example: "rgb(58, 123, 213)"
   */
  rgbColor: () => {
    const r = random.number(0, 255);
    const g = random.number(0, 255);
    const b = random.number(0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  },
};

export default random;
