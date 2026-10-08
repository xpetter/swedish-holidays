# Changelog

## Unreleased

## 1.1.1 - 2026-10-08

### Fixed

- Browser ESM imports now use a standalone module with native default and named exports.
  CommonJS, classic browser scripts, and AMD remain supported.
- Added regression coverage for strict ESM linking and all API exports across module formats.

## 1.1.0 - 2026-06-11

### Fixed

- Named days that fall on the same date no longer overwrite each other.
  For example, in 2008 Kristi himmelsfärdsdag fell on Första maj — previously
  only one of them was returned. `getSwedishNamedDays()` now includes both,
  and flags like `isPublicHoliday` / `isEve` consider all named days on a date.
- `getSwedishDayInfo('9999-12-31')` and `getSwedishRedDays(9999)` no longer
  throw. The `nextDayIsWorkFree` lookup previously crashed at the upper edge
  of the supported year range.

### Added

- New `holidayNames` field on `getSwedishDayInfo()` results: an array of all
  named days on the date, ordered public holiday > eve > observance.
  `holidayName` and `holidayType` reflect the first (highest-priority) entry.
- ESM support: `import SwedishCalendar from 'swedish-holidays'` and named
  imports now work via a new `exports` map and `src/swedish-calendar.mjs`.
- Test suite built on the Node.js built-in test runner (`npm test`).
- ESLint and Prettier configuration (`npm run lint`, `npm run format`).
- GitHub Actions CI running lint, format check, and tests on Node 18/20/22.

## 1.0.0 - 2026-04-21

- Initial release
- Swedish public holidays
- Red days
- Work-free days
- Holiday eves
- ISO week helpers
- Full API documentation in README
