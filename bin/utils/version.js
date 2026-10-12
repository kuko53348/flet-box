/**
 * @file bin/utils/version.js
 * @description FletBox "odometer" version scheme.
 *
 * A version is `MAJOR.MINOR.PATCH` where MAJOR grows without bound (1, 2, … ∞)
 * while MINOR and PATCH are single digits that cycle 0–9. Incrementing past 9
 * carries into the next position to the left and resets the current one to 0:
 *
 *   1.0.8 → 1.0.9 → 1.1.0 → … → 1.9.9 → 2.0.0 → … → 9.9.9 → 10.0.0 → …
 *
 * This is a deliberate, self-contained scheme (not stock semver carry, which
 * would allow PATCH to exceed 9). It is used by `createBundle` to stamp the
 * build and by `flet-box release` to auto-increment on each release.
 */

const DIGIT_MAX = 9;

/**
 * Parses and validates a `MAJOR.MINOR.PATCH` string.
 *
 * @param {string} version - Version string, e.g. `"1.0.0"`.
 * @returns {{ major: number, minor: number, patch: number }}
 * @throws {Error} When the string is not a valid FletBox version.
 */
export const parseVersion = (version) => {
  const match = /^(\d+)\.(\d)\.(\d)$/.exec(String(version).trim());
  if (!match) {
    throw new Error(
      `Invalid version "${version}". Expected MAJOR.MINOR.PATCH where MINOR and PATCH are single digits (0-9), e.g. "1.0.0".`,
    );
  }
  const [, major, minor, patch] = match.map(Number);
  return { major, minor, patch };
};

/**
 * Formats version parts back into a `MAJOR.MINOR.PATCH` string.
 *
 * @param {{ major: number, minor: number, patch: number }} parts
 * @returns {string}
 */
export const formatVersion = ({ major, minor, patch }) =>
  `${major}.${minor}.${patch}`;

/**
 * Returns true when `version` is a valid FletBox version string.
 *
 * @param {string} version
 * @returns {boolean}
 */
export const isValidVersion = (version) => {
  try {
    parseVersion(version);
    return true;
  } catch {
    return false;
  }
};

/**
 * Increments a version following the odometer carry rules.
 *
 * - `patch` (default): +1 on PATCH; carrying resets the lower position to 0.
 * - `minor`: +1 on MINOR, PATCH resets to 0; MINOR may carry into MAJOR.
 * - `major`: +1 on MAJOR, MINOR and PATCH reset to 0.
 *
 * MAJOR never caps; MINOR and PATCH wrap at 9.
 *
 * @param {string} version - Current version, e.g. `"1.0.9"`.
 * @param {"patch"|"minor"|"major"} [type="patch"] - Which position to bump.
 * @returns {string} The next version string.
 */
export const incrementVersion = (version, type = "patch") => {
  const parts = parseVersion(version);
  let { major, minor, patch } = parts;

  if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
    return formatVersion({ major, minor, patch });
  }

  if (type === "minor") {
    minor += 1;
    patch = 0;
    if (minor > DIGIT_MAX) {
      minor = 0;
      major += 1;
    }
    return formatVersion({ major, minor, patch });
  }

  // Default: patch increment with carry.
  patch += 1;
  if (patch > DIGIT_MAX) {
    patch = 0;
    minor += 1;
    if (minor > DIGIT_MAX) {
      minor = 0;
      major += 1;
    }
  }
  return formatVersion({ major, minor, patch });
};

/** The first version a brand-new project starts at. */
export const INITIAL_VERSION = "1.0.0";
