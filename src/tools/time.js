// tools/time.js - COMPLETE VERSION

/**
 * ============================================================
 * TIME HELPERS - Complete Natural English
 * ============================================================
 */

// ========== TIME UNITS ==========
export const seconds = (n) => n * 1000;
export const minutes = (n) => n * 60 * 1000;
export const hours = (n) => n * 60 * 60 * 1000;
export const days = (n) => n * 24 * 60 * 60 * 1000;
export const weeks = (n) => n * 7 * 24 * 60 * 60 * 1000;
export const months = (n) => n * 30 * days(1);
export const years = (n) => n * 365 * days(1);

// ========== CURRENT ==========
export const now = () => Date.now();

export const today = () => formatDate(now(), "YYYY-MM-DD");
export const yesterday = () => formatDate(now() - days(1), "YYYY-MM-DD");
export const tomorrow = () => formatDate(now() + days(1), "YYYY-MM-DD");

// ========== DATE INFO ==========
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

export const isToday = (date) => formatDate(date) === today();
export const isYesterday = (date) => formatDate(date) === yesterday();
export const isTomorrow = (date) => formatDate(date) === tomorrow();
export const isWeekend = (date) => [0, 6].includes(new Date(date).getDay());
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// ========== FORMAT ==========
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

export const formatDateLong = (date, locale = "en-US") => {
  return new Date(date).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateShort = (date, locale = "en-US") => {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date) => formatDate(date, "HH:mm:ss");
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
export const addDays = (date, n) =>
  new Date(new Date(date).getTime() + days(n));
export const addHours = (date, n) =>
  new Date(new Date(date).getTime() + hours(n));
export const addMinutes = (date, n) =>
  new Date(new Date(date).getTime() + minutes(n));
export const addSeconds = (date, n) =>
  new Date(new Date(date).getTime() + seconds(n));

export const subtractDays = (date, n) => addDays(date, -n);
export const subtractHours = (date, n) => addHours(date, -n);
export const subtractMinutes = (date, n) => addMinutes(date, -n);
export const subtractSeconds = (date, n) => addSeconds(date, -n);

// ========== RELATIVE ==========
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

export const relativeTime = timeAgo;

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
export const waitFor = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export const wait = waitFor;
export const sleep = waitFor;

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
export const every = (ms, callback) => setInterval(callback, ms);
export const everySecond = (callback) => every(seconds(1), callback);
export const everyMinute = (callback) => every(minutes(1), callback);
export const everyHour = (callback) => every(hours(1), callback);
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
