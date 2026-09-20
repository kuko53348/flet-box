// tools/time.js - COMPLETE VERSION

/**
 * ============================================================
 * TIME HELPERS - Complete Natural English
 * ============================================================
 */

// ========== TIME UNITS ==========

/**
 * Converts seconds to milliseconds.
 * @param {number} n - Number of seconds.
 * @returns {number} Equivalent milliseconds.
 */
export const seconds = (n) => n * 1000;

/**
 * Converts minutes to milliseconds.
 * @param {number} n - Number of minutes.
 * @returns {number} Equivalent milliseconds.
 */
export const minutes = (n) => n * 60 * 1000;

/**
 * Converts hours to milliseconds.
 * @param {number} n - Number of hours.
 * @returns {number} Equivalent milliseconds.
 */
export const hours = (n) => n * 60 * 60 * 1000;

/**
 * Converts days to milliseconds.
 * @param {number} n - Number of days.
 * @returns {number} Equivalent milliseconds.
 */
export const days = (n) => n * 24 * 60 * 60 * 1000;

/**
 * Converts weeks to milliseconds.
 * @param {number} n - Number of weeks.
 * @returns {number} Equivalent milliseconds.
 */
export const weeks = (n) => n * 7 * 24 * 60 * 60 * 1000;

/**
 * Converts months (approximated as 30 days) to milliseconds.
 * @param {number} n - Number of months.
 * @returns {number} Equivalent milliseconds.
 */
export const months = (n) => n * 30 * days(1);

/**
 * Converts years (approximated as 365 days) to milliseconds.
 * @param {number} n - Number of years.
 * @returns {number} Equivalent milliseconds.
 */
export const years = (n) => n * 365 * days(1);

// ========== CURRENT ==========

/**
 * Returns the current Unix timestamp in milliseconds.
 * @returns {number} Current time as a Unix epoch in ms.
 */
export const now = () => Date.now();

/**
 * Returns today's date formatted as `YYYY-MM-DD`.
 * @returns {string} Today's date string.
 */
export const today = () => formatDate(now(), "YYYY-MM-DD");

/**
 * Returns yesterday's date formatted as `YYYY-MM-DD`.
 * @returns {string} Yesterday's date string.
 */
export const yesterday = () => formatDate(now() - days(1), "YYYY-MM-DD");

/**
 * Returns tomorrow's date formatted as `YYYY-MM-DD`.
 * @returns {string} Tomorrow's date string.
 */
export const tomorrow = () => formatDate(now() + days(1), "YYYY-MM-DD");

// ========== DATE INFO ==========

/**
 * Returns the full English name of the day of the week for a given date.
 * @param {Date|number|string} date - Any value accepted by `new Date()`.
 * @returns {string} Day name, e.g. `"Monday"`.
 */
export const dayOfWeek = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date(date).getDay()];
};

/**
 * Returns the full English name of the month for a given date.
 * @param {Date|number|string} date - Any value accepted by `new Date()`.
 * @returns {string} Month name, e.g. `"January"`.
 */
export const monthName = (date) => {
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
  return months[new Date(date).getMonth()];
};

/**
 * Returns `true` if the given date falls on today.
 * @param {Date|number|string} date - Date to check.
 * @returns {boolean}
 */
export const isToday = (date) => formatDate(date) === today();

/**
 * Returns `true` if the given date falls on yesterday.
 * @param {Date|number|string} date - Date to check.
 * @returns {boolean}
 */
export const isYesterday = (date) => formatDate(date) === yesterday();

/**
 * Returns `true` if the given date falls on tomorrow.
 * @param {Date|number|string} date - Date to check.
 * @returns {boolean}
 */
export const isTomorrow = (date) => formatDate(date) === tomorrow();

/**
 * Returns `true` if the given date falls on a Saturday or Sunday.
 * @param {Date|number|string} date - Date to check.
 * @returns {boolean}
 */
export const isWeekend = (date) => [0, 6].includes(new Date(date).getDay());

/**
 * Returns `true` if the given year is a leap year.
 * @param {number} year - Four-digit year.
 * @returns {boolean}
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// ========== FORMAT ==========

/**
 * Formats a date according to a token-based format string.
 *
 * Supported tokens: `YYYY` (year), `MM` (month), `DD` (day),
 * `HH` (hours, 24h), `mm` (minutes), `ss` (seconds).
 *
 * @param {Date|number|string} date - Date to format.
 * @param {string} [format="YYYY-MM-DD"] - Output format string.
 * @returns {string} Formatted date string.
 *
 * @example
 * formatDate(new Date(), "YYYY-MM-DD HH:mm:ss") // "2024-01-15 09:30:00"
 */
export const formatDate = (date, format = "YYYY-MM-DD") => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

/**
 * Formats a date as a long human-readable string using the Intl API.
 *
 * @param {Date|number|string} date - Date to format.
 * @param {string} [locale="en-US"] - BCP 47 locale string.
 * @returns {string} Long date string, e.g. `"Monday, January 15, 2024"`.
 */
export const formatDateLong = (date, locale = "en-US") => {
  return new Date(date).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats a date as a short human-readable string using the Intl API.
 *
 * @param {Date|number|string} date - Date to format.
 * @param {string} [locale="en-US"] - BCP 47 locale string.
 * @returns {string} Short date string, e.g. `"Jan 15, 2024"`.
 */
export const formatDateShort = (date, locale = "en-US") => {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a date as a 24-hour time string `HH:mm:ss`.
 * @param {Date|number|string} date - Date to format.
 * @returns {string} Time string, e.g. `"14:05:30"`.
 */
export const formatTime = (date) => formatDate(date, "HH:mm:ss");

/**
 * Formats a date as a 12-hour time string with AM/PM suffix.
 * @param {Date|number|string} date - Date to format.
 * @returns {string} Time string, e.g. `"02:05:30 PM"`.
 */
export const formatTimeAmPm = (date) => {
  const d = new Date(date);
  let hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
};

// ========== PARSE ==========

/**
 * Parses a date string into a `Date` object using a simple token-based format.
 *
 * Supported tokens: `YYYY`, `MM`, `DD`, `HH`, `mm`, `ss`.
 * Separators can be `-`, `/`, `:`, or a space.
 *
 * @param {string} str - Date string to parse.
 * @param {string} [format="YYYY-MM-DD"] - Format string describing the input.
 * @returns {Date} Parsed `Date` object.
 *
 * @example
 * parseDate("2024-01-15", "YYYY-MM-DD")
 * parseDate("15/01/2024", "DD/MM/YYYY")
 */
export const parseDate = (str, format = "YYYY-MM-DD") => {
  // Simple parser for common formats
  const parts = str.split(/[-/:\s]/);
  const fmt = format.split(/[-/:\s]/);

  let year = new Date().getFullYear();
  let month = 0;
  let day = 1;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  fmt.forEach((f, i) => {
    const val = parseInt(parts[i]);
    if (f === "YYYY") year = val;
    else if (f === "MM") month = val - 1;
    else if (f === "DD") day = val;
    else if (f === "HH") hours = val;
    else if (f === "mm") minutes = val;
    else if (f === "ss") seconds = val;
  });

  return new Date(year, month, day, hours, minutes, seconds);
};

// ========== DIFF ==========

/**
 * Returns the absolute difference between two dates in the specified unit.
 *
 * @param {Date|number|string} date1 - First date.
 * @param {Date|number|string} date2 - Second date.
 * @param {"milliseconds"|"seconds"|"minutes"|"hours"|"days"|"weeks"|"months"|"years"} [unit="days"] - Output unit.
 * @returns {number} Absolute difference in the requested unit.
 *
 * @example
 * dateDiff("2024-01-01", "2024-01-15", "days") // 14
 */
export const dateDiff = (date1, date2, unit = "days") => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  const units = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7,
    months: 1000 * 60 * 60 * 24 * 30,
    years: 1000 * 60 * 60 * 24 * 365,
  };
  return diff / units[unit];
};

// ========== MANIPULATE ==========

/**
 * Adds `n` days to a date and returns a new `Date`.
 * @param {Date|number|string} date - Base date.
 * @param {number} n - Number of days to add (negative to subtract).
 * @returns {Date}
 */
export const addDays = (date, n) =>
  new Date(new Date(date).getTime() + days(n));

/**
 * Adds `n` hours to a date and returns a new `Date`.
 * @param {Date|number|string} date - Base date.
 * @param {number} n - Number of hours to add (negative to subtract).
 * @returns {Date}
 */
export const addHours = (date, n) =>
  new Date(new Date(date).getTime() + hours(n));

/**
 * Adds `n` minutes to a date and returns a new `Date`.
 * @param {Date|number|string} date - Base date.
 * @param {number} n - Number of minutes to add (negative to subtract).
 * @returns {Date}
 */
export const addMinutes = (date, n) =>
  new Date(new Date(date).getTime() + minutes(n));

/**
 * Adds `n` seconds to a date and returns a new `Date`.
 * @param {Date|number|string} date - Base date.
 * @param {number} n - Number of seconds to add (negative to subtract).
 * @returns {Date}
 */
export const addSeconds = (date, n) =>
  new Date(new Date(date).getTime() + seconds(n));

/**
 * Subtracts `n` days from a date and returns a new `Date`.
 * @param {Date|number|string} date - Base date.
 * @param {number} n - Number of days to subtract.
 * @returns {Date}
 */
export const subtractDays = (date, n) => addDays(date, -n);

/**
 * Subtracts `n` hours from a date and returns a new `Date`.
 * @param {Date|number|string} date - Base date.
 * @param {number} n - Number of hours to subtract.
 * @returns {Date}
 */
export const subtractHours = (date, n) => addHours(date, -n);

/**
 * Subtracts `n` minutes from a date and returns a new `Date`.
 * @param {Date|number|string} date - Base date.
 * @param {number} n - Number of minutes to subtract.
 * @returns {Date}
 */
export const subtractMinutes = (date, n) => addMinutes(date, -n);

/**
 * Subtracts `n` seconds from a date and returns a new `Date`.
 * @param {Date|number|string} date - Base date.
 * @param {number} n - Number of seconds to subtract.
 * @returns {Date}
 */
export const subtractSeconds = (date, n) => addSeconds(date, -n);

// ========== RELATIVE ==========

/**
 * Returns a human-readable relative time string in English, e.g. `"3 days ago"`.
 * Returns `"just now"` for differences under 1 second.
 *
 * @param {Date|number|string} date - The past date to compare against now.
 * @returns {string} Relative time string.
 *
 * @example
 * timeAgo(Date.now() - 5 * 60 * 1000) // "5 minutes ago"
 */
export const timeAgo = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diff / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

/** Alias for {@link timeAgo}. */
export const relativeTime = timeAgo;

/**
 * Returns a human-readable relative time string in the specified locale.
 * Supports `"en"` (English) and `"es"` (Spanish); falls back to English.
 *
 * @param {Date|number|string} date - The past date to compare against now.
 * @param {"en"|"es"} [locale="en"] - Output locale.
 * @returns {string} Locale-aware relative time string.
 *
 * @example
 * timeAgoLocale(Date.now() - 3600000, "es") // "hace 1 hora"
 */
export const timeAgoLocale = (date, locale = "en") => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  const intervals = {
    en: [
      { label: "year", seconds: 31536000, plural: "years" },
      { label: "month", seconds: 2592000, plural: "months" },
      { label: "week", seconds: 604800, plural: "weeks" },
      { label: "day", seconds: 86400, plural: "days" },
      { label: "hour", seconds: 3600, plural: "hours" },
      { label: "minute", seconds: 60, plural: "minutes" },
      { label: "second", seconds: 1, plural: "seconds" },
    ],
    es: [
      { label: "año", seconds: 31536000, plural: "años" },
      { label: "mes", seconds: 2592000, plural: "meses" },
      { label: "semana", seconds: 604800, plural: "semanas" },
      { label: "día", seconds: 86400, plural: "días" },
      { label: "hora", seconds: 3600, plural: "horas" },
      { label: "minuto", seconds: 60, plural: "minutos" },
      { label: "segundo", seconds: 1, plural: "segundos" },
    ],
  };

  const lang = intervals[locale] || intervals.en;
  for (const interval of lang) {
    const count = Math.floor(diff / interval.seconds);
    if (count >= 1) {
      const label = count > 1 ? interval.plural : interval.label;
      if (locale === "es") return `hace ${count} ${label}`;
      return `${count} ${label} ago`;
    }
  }
  return locale === "es" ? "ahora mismo" : "just now";
};

// ========== WAIT ==========

/**
 * Returns a promise that resolves after `ms` milliseconds.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
export const waitFor = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Alias for {@link waitFor}. */
export const wait = waitFor;

/** Alias for {@link waitFor}. */
export const sleep = waitFor;

/**
 * Polls `condition` every `interval` ms until it returns truthy or `timeout` ms elapse.
 *
 * @param {Function} condition - Zero-argument predicate to evaluate each interval.
 * @param {number} [timeout] - Maximum wait time in ms (default: 30 seconds).
 * @param {number} [interval] - Polling interval in ms (default: 1 second).
 * @returns {Promise<true>} Resolves `true` when the condition is met.
 * @throws {Error} Throws if the timeout is reached before the condition is satisfied.
 */
export const waitUntil = async (
  condition,
  timeout = seconds(30),
  interval = seconds(1),
) => {
  const startTime = now();
  while (now() - startTime < timeout) {
    if (condition()) return true;
    await waitFor(interval);
  }
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
};

/**
 * Polls the DOM for a CSS selector until the element appears or the timeout elapses.
 *
 * @param {string} selector - CSS selector to look for.
 * @param {number} [timeout] - Maximum wait time in ms (default: 10 seconds).
 * @param {number} [interval] - Polling interval in ms (default: 0.5 seconds).
 * @returns {Promise<Element>} Resolves with the found DOM element.
 * @throws {Error} Throws if the element is not found within the timeout.
 */
export const waitForElement = async (
  selector,
  timeout = seconds(10),
  interval = seconds(0.5),
) => {
  const startTime = now();
  while (now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await waitFor(interval);
  }
  throw new Error(`Element not found: ${selector}`);
};

// ========== TIMER ==========

/**
 * Creates a named performance timer. Call `stop()` to log and retrieve the elapsed time,
 * or `elapsed()` to read it without logging.
 *
 * @param {string} label - Label printed with the elapsed time when `stop()` is called.
 * @returns {{ stop: Function, elapsed: Function }}
 *
 * @example
 * const t = timer("fetchUsers");
 * await fetchUsers();
 * t.stop(); // logs "⏱️ fetchUsers: 142ms"
 */
export const timer = (label) => {
  const start = now();
  return {
    stop: () => {
      const elapsed = now() - start;
      console.log(`⏱️ ${label}: ${elapsed}ms`);
      return elapsed;
    },
    elapsed: () => now() - start,
  };
};

// ========== INTERVAL ==========

/**
 * Calls `callback` repeatedly every `ms` milliseconds.
 * Returns the interval ID so it can be cancelled with `clearInterval`.
 *
 * @param {number} ms - Interval duration in milliseconds.
 * @param {Function} callback - Function to call on each tick.
 * @returns {number} Interval ID.
 */
export const every = (ms, callback) => setInterval(callback, ms);

/**
 * Calls `callback` once per second.
 * @param {Function} callback - Function to call each second.
 * @returns {number} Interval ID.
 */
export const everySecond = (callback) => every(seconds(1), callback);

/**
 * Calls `callback` once per minute.
 * @param {Function} callback - Function to call each minute.
 * @returns {number} Interval ID.
 */
export const everyMinute = (callback) => every(minutes(1), callback);

/**
 * Calls `callback` once per hour.
 * @param {Function} callback - Function to call each hour.
 * @returns {number} Interval ID.
 */
export const everyHour = (callback) => every(hours(1), callback);

/**
 * Calls `callback` once per day.
 * @param {Function} callback - Function to call each day.
 * @returns {number} Interval ID.
 */
export const everyDay = (callback) => every(days(1), callback);

// ========== EXPORT ==========
export default {
  // Units
  seconds,
  minutes,
  hours,
  days,
  weeks,
  months,
  years,

  // Current
  now,
  today,
  yesterday,
  tomorrow,

  // Info
  dayOfWeek,
  monthName,
  isToday,
  isYesterday,
  isTomorrow,
  isWeekend,
  isLeapYear,

  // Format
  formatDate,
  formatDateLong,
  formatDateShort,
  formatTime,
  formatTimeAmPm,

  // Parse
  parseDate,

  // Diff
  dateDiff,

  // Manipulate
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  subtractDays,
  subtractHours,
  subtractMinutes,
  subtractSeconds,

  // Relative
  timeAgo,
  relativeTime,
  timeAgoLocale,

  // Wait
  waitFor,
  wait,
  sleep,
  waitUntil,
  waitForElement,

  // Timer & Interval
  timer,
  every,
  everySecond,
  everyMinute,
  everyHour,
  everyDay,
};
