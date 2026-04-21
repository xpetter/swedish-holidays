# swedish-holidays

Standalone JavaScript library for Swedish public holidays, red days, work-free days, eves, and ISO week utilities.

## Features

- Swedish public holidays
- Red days (`röda dagar`)
- Work-free days (`arbetsfria dagar`)
- Holiday eves (`aftnar`)
- ISO week helpers
- No dependencies
- Works in browser, Node.js / CommonJS, and AMD

## Installation

### Direct download

Copy `src/swedish-calendar.js` into your project.

### Browser

```html
<script src="src/swedish-calendar.js"></script>
<script>
    const info = SwedishCalendar.getSwedishDayInfo('2026-12-24');
    console.log(info.holidayName);   // "Julafton"
    console.log(info.isWorkFreeDay); // true
</script>
```

### Node.js / CommonJS

```javascript
const SwedishCalendar = require('./src/swedish-calendar.js');

console.log(SwedishCalendar.isSwedishRedDay('2026-12-25')); // true
```

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
- `holidayName` — Swedish holiday name or `null`
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

Returns all named days for a year, sorted by date.

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

## License

MIT
