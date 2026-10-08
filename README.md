# swedish-holidays

Standalone JavaScript library for Swedish public holidays, red days, work-free days, eves, and ISO week utilities.

## Features

- Swedish public holidays
- Red days (`röda dagar`)
- Work-free days (`arbetsfria dagar`)
- Holiday eves (`aftnar`)
- ISO week helpers
- No dependencies
- Works in browser, Node.js (CommonJS and ESM), and AMD

## Installation

### Direct download

Copy `src/swedish-calendar.js` for CommonJS or classic browser scripts, or the standalone `src/swedish-calendar.mjs` for ESM.

### Browser

```html
<script src="src/swedish-calendar.js"></script>
<script>
  const info = SwedishCalendar.getSwedishDayInfo('2026-12-24');
  console.log(info.holidayName); // "Julafton"
  console.log(info.isWorkFreeDay); // true
</script>
```

### Browser / ESM

```html
<script type="module">
  import SwedishCalendar, { isSwedishRedDay } from './src/swedish-calendar.mjs';

  console.log(isSwedishRedDay('2026-12-25')); // true
  console.log(SwedishCalendar.getSwedishDayInfo('2026-12-24').holidayName); // "Julafton"
</script>
```

Serve the module over HTTP with a JavaScript MIME type. No bundler or global variable is required.

### Node.js / CommonJS

```javascript
const SwedishCalendar = require('./src/swedish-calendar.js');

console.log(SwedishCalendar.isSwedishRedDay('2026-12-25')); // true
```

### Node.js / ESM

```javascript
import SwedishCalendar, { isSwedishRedDay } from './src/swedish-calendar.mjs';

console.log(isSwedishRedDay('2026-12-25')); // true
console.log(SwedishCalendar.getSwedishDayInfo('2026-12-24').holidayName); // "Julafton"
```

If the package is installed from npm, `require('swedish-holidays')` and `import ... from 'swedish-holidays'` both work via the `exports` map in `package.json`.

## Concepts

The library distinguishes between these types of named days:

- `public_holiday`
  Official Swedish public holidays such as `Juldagen` and `Långfredagen`.

- `eve`
  Named eves such as `Julafton`, `Midsommarafton`, and `Skärtorsdagen`.

- `observance`
  Named observances that are neither public holidays nor eves. Currently includes `Annandag pingst`.

The library also exposes two important boolean classifications:

- `isRedDay`
  All Sundays and all public holidays.

- `isWorkFreeDay`
  All red days, all Saturdays, and the following eves:
  - `Påskafton`
  - `Midsommarafton`
  - `Julafton`
  - `Nyårsafton`

### Colliding named days

Two named days can fall on the same date. For example, in 2008 `Kristi himmelsfärdsdag` fell on `Första maj`, and in 2049 `Pingstdagen` falls on `Sveriges nationaldag`. The library keeps all named days in such years:

- `getSwedishNamedDays()` returns one entry per named day, so a date can appear twice.
- `getSwedishDayInfo()` exposes all names in `holidayNames`, ordered by priority (`public_holiday` > `eve` > `observance`). `holidayName` and `holidayType` reflect the first entry.
- Boolean flags such as `isPublicHoliday` and `isEve` consider every named day on the date.

## API

### `getSwedishDayInfo(input)`

Returns full information for a single day.

Accepted input:

- JavaScript `Date`
- ISO date string in format `YYYY-MM-DD`

```javascript
const info = SwedishCalendar.getSwedishDayInfo('2026-12-24');
console.log(info);
```

Returned object:

```javascript
{
    date: '2026-12-24',
    year: 2026,
    month: 12,
    day: 24,
    isoWeekYear: 2026,
    isoWeek: 52,
    isoDayOfWeek: 4,
    dayOfWeek: 4,
    dayNameSv: 'Torsdag',
    isSaturday: false,
    isSunday: false,
    isWeekend: false,
    isPublicHoliday: false,
    isRedDay: false,
    isWorkFreeDay: true,
    isEve: true,
    holidayName: 'Julafton',
    holidayNames: ['Julafton'],
    holidayType: 'eve',
    nextDayIsWorkFree: true
}
```

Fields:

- `date` — ISO date string
- `year` — Gregorian year
- `month` — Month number `1-12`
- `day` — Day of month
- `isoWeekYear` — ISO week-numbering year
- `isoWeek` — ISO week number
- `isoDayOfWeek` — ISO weekday where `1 = Monday` and `7 = Sunday`
- `dayOfWeek` — JavaScript UTC weekday where `0 = Sunday` and `6 = Saturday`
- `dayNameSv` — Swedish weekday name
- `isSaturday` — `true` if Saturday
- `isSunday` — `true` if Sunday
- `isWeekend` — `true` if Saturday or Sunday
- `isPublicHoliday` — `true` if the day is a named public holiday
- `isRedDay` — `true` if Sunday or public holiday
- `isWorkFreeDay` — `true` if red day, Saturday, or one of the extra work-free eves
- `isEve` — `true` if the day is a named eve
- `holidayName` — Swedish name of the highest-priority named day, or `null`
- `holidayNames` — Array of all Swedish names on the date (usually 0 or 1 entries, 2 when named days collide)
- `holidayType` — `'public_holiday' | 'eve' | 'observance' | 'none'`
- `nextDayIsWorkFree` — `true` if the following day is work-free

Notes:

- `holidayType` only reflects named days. A regular Sunday that is not otherwise named still has `isRedDay = true`.
- `nextDayIsWorkFree` is forward-looking only.

### `getSwedishDayInfoByIsoWeek(isoWeek, isoDayOfWeek, isoWeekYear)`

Returns the same object as `getSwedishDayInfo()`, but looked up from ISO week data.

```javascript
const info = SwedishCalendar.getSwedishDayInfoByIsoWeek(25, 5, 2026);
console.log(info.date); // "2026-06-19"
```

Arguments:

- `isoWeek` — ISO week number
- `isoDayOfWeek` — ISO weekday `1-7`
- `isoWeekYear` — ISO week-numbering year

### `getIsoDateFromWeek(isoWeek, isoDayOfWeek, isoWeekYear)`

Returns an ISO date string from ISO week input.

```javascript
const date = SwedishCalendar.getIsoDateFromWeek(44, 6, 2026);
console.log(date); // "2026-10-31"
```

### `getDateFromIsoWeek(isoWeek, isoDayOfWeek, isoWeekYear)`

Returns a UTC `Date` object from ISO week input.

```javascript
const date = SwedishCalendar.getDateFromIsoWeek(44, 6, 2026);
console.log(date.toISOString()); // 2026-10-31T00:00:00.000Z
```

### `getIsoWeeksInYear(year)`

Returns the number of ISO weeks in the given year.

```javascript
console.log(SwedishCalendar.getIsoWeeksInYear(2026)); // 53
```

Returns:

- `52` or `53`

### Boolean helper methods

#### `isSwedishPublicHoliday(input)`

```javascript
console.log(SwedishCalendar.isSwedishPublicHoliday('2026-12-25')); // true
```

#### `isSwedishRedDay(input)`

```javascript
console.log(SwedishCalendar.isSwedishRedDay('2026-12-25')); // true
```

#### `isSwedishWorkFreeDay(input)`

```javascript
console.log(SwedishCalendar.isSwedishWorkFreeDay('2026-12-24')); // true
```

#### `isSwedishHolidayEve(input)`

```javascript
console.log(SwedishCalendar.isSwedishHolidayEve('2026-12-24')); // true
```

All helper methods accept:

- JavaScript `Date`
- ISO date string `YYYY-MM-DD`

### `getSwedishNamedDays(year)`

Returns all named days for a year, sorted by date. In years where two named days fall on the same date, both are included.

```javascript
const days = SwedishCalendar.getSwedishNamedDays(2026);
console.log(days[0]);
```

Each array item has this shape:

```javascript
{
    key: 'new_years_day',
    nameSv: 'Nyårsdagen',
    date: '2026-01-01',
    kind: 'public_holiday'
}
```

### `getSwedishRedDays(year)`

Returns all red days in a year as sorted ISO date strings.

```javascript
const redDays = SwedishCalendar.getSwedishRedDays(2026);
console.log(redDays);
```

### `getSwedishWorkFreeDays(year)`

Returns all work-free days in a year as sorted ISO date strings.

```javascript
const workFreeDays = SwedishCalendar.getSwedishWorkFreeDays(2026);
console.log(workFreeDays);
```

## Supported input

Functions that accept a date input support:

- `Date`
- ISO string in format `YYYY-MM-DD`

Invalid input throws `TypeError`.

Supported year range:

- `1583` to `9999`

## Included named days

The current implementation includes:

- Nyårsdagen
- Trettondagsafton
- Trettondedag jul
- Skärtorsdagen
- Långfredagen
- Påskafton
- Påskdagen
- Annandag påsk
- Valborgsmässoafton
- Första maj
- Kristi himmelsfärdsdag
- Pingstafton
- Pingstdagen
- Annandag pingst
- Sveriges nationaldag
- Midsommarafton
- Midsommardagen
- Allhelgonaafton
- Alla helgons dag
- Julafton
- Juldagen
- Annandag jul
- Nyårsafton

## Development

```bash
npm install
npm test             # run the test suite (Node.js built-in test runner)
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
```

Tests, lint, and format checks run automatically in CI (GitHub Actions) on Node 18, 20, and 22.

## License

[MIT](LICENSE) © xpetter

## Maintaining module builds

`src/swedish-calendar.js` is the source of truth for the calendar implementation.
After changing it, run `npm run build:esm` and commit the generated standalone ESM file.
`npm test` checks that the generated file is current, and `npm pack` regenerates it before packaging.
The compatibility tests load the module graph as ESM without CommonJS interop and verify every
export against CommonJS, classic browser globals, and AMD.
