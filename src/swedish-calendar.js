/**
 * SwedishCalendar
 * ===============================================================================
 * Standalone JavaScript library for the Swedish calendar — public holidays,
 * red days, work-free days, and eves. Based on modern Swedish conventions.
 *
 * CLASSIFICATION
 * ---------------------------------------------------------------------------
 * The library distinguishes between four kinds of named days:
 *
 *   - Public holiday (public_holiday)
 *       Named holidays according to Swedish law, e.g. Juldagen, Långfredagen.
 *
 *   - Eve (eve)
 *       Eves that are not holidays themselves, e.g. Skärtorsdagen, Julafton,
 *       Valborgsmässoafton. Some eves are treated as work-free (see below).
 *
 *   - Observance (observance)
 *       Named days that are neither public holidays nor eves but still worth
 *       labeling. Currently: Annandag pingst (was a public holiday until
 *       2005, when it was replaced by Sveriges nationaldag).
 *
 * Two additional properties are exposed as booleans (not as "kind"):
 *
 *   - Red day (röd dag)
 *       All Sundays + all public holidays. Matches "röda dagar" in the
 *       Swedish almanac. Exposed via the isRedDay flag.
 *
 *   - Work-free day (arbetsfri dag)
 *       All red days + all Saturdays + four eves that are not public holidays
 *       but are still treated as time off: Påskafton, Midsommarafton,
 *       Julafton, Nyårsafton. Exposed via the isWorkFreeDay flag.
 *
 * API (all functions on the SwedishCalendar object)
 * ---------------------------------------------------------------------------
 *
 *   getSwedishDayInfo(input)
 *     Full information about a single day. Input: Date object or ISO string
 *     ("YYYY-MM-DD"). Returns an object with:
 *       date, year, month, day, isoWeekYear, isoWeek, isoDayOfWeek,
 *       dayOfWeek, dayNameSv, isSaturday, isSunday, isWeekend,
 *       isPublicHoliday, isRedDay, isWorkFreeDay, isEve, holidayName,
 *       holidayNames, holidayType ('public_holiday' | 'eve' | 'observance'
 *       | 'none'), nextDayIsWorkFree
 *     Swedish-language values: dayNameSv (e.g. "Måndag") and holidayName
 *     (e.g. "Julafton").
 *     Note: two named days can fall on the same date (e.g. in 2008,
 *     Kristi himmelsfärdsdag fell on Första maj). holidayNames lists all of
 *     them, ordered public_holiday > eve > observance; holidayName and
 *     holidayType reflect the first (highest-priority) one.
 *     Note: holidayType reflects only the kind of a named day. For Sundays
 *     that are not named, use isSunday / isRedDay instead.
 *     Note: nextDayIsWorkFree is purely forward-looking — it returns true
 *     whenever the following date is work-free, even if the current day is
 *     itself work-free (e.g. Julafton → true because Juldagen is work-free).
 *
 *   getSwedishDayInfoByIsoWeek(isoWeek, isoDayOfWeek, isoWeekYear)
 *     Same as above, but looked up by ISO week triplet.
 *     isoDayOfWeek: 1 = Monday, 7 = Sunday.
 *     Example: getSwedishDayInfoByIsoWeek(25, 5, 2026) → 2026-06-19 (Midsommarafton).
 *
 *   getIsoDateFromWeek(isoWeek, isoDayOfWeek, isoWeekYear)
 *     Returns an ISO date "YYYY-MM-DD" for a given ISO week triplet.
 *
 *   getDateFromIsoWeek(isoWeek, isoDayOfWeek, isoWeekYear)
 *     Same as getIsoDateFromWeek but returns a UTC Date object.
 *
 *   getIsoWeeksInYear(year)
 *     Returns the number of ISO weeks in the given year (52 or 53).
 *
 *   isSwedishPublicHoliday(input)
 *   isSwedishRedDay(input)
 *   isSwedishWorkFreeDay(input)
 *   isSwedishHolidayEve(input)
 *     Boolean shortcuts for getSwedishDayInfo.
 *
 *   getSwedishNamedDays(year)
 *     Sorted array of all named days for a year.
 *     Each entry: { key, nameSv, date, kind: 'public_holiday' | 'eve' | 'observance' }.
 *     The nameSv field holds the Swedish display name, e.g. "Julafton".
 *     Two entries can share the same date in years where named days collide.
 *
 *   getSwedishRedDays(year)
 *     Sorted array of ISO dates for every red day in the year.
 *
 *   getSwedishWorkFreeDays(year)
 *     Sorted array of ISO dates for every work-free day in the year.
 *
 * EXAMPLES
 * ---------------------------------------------------------------------------
 *
 *   // Browser (global)
 *   <script src="swedish-calendar.js"></script>
 *   <script>
 *     const info = SwedishCalendar.getSwedishDayInfo('2026-12-24');
 *     console.log(info.holidayName);    // "Julafton"
 *     console.log(info.isWorkFreeDay);  // true
 *     console.log(info.isRedDay);       // false  (Julafton is not a red day)
 *   </script>
 *
 *   // Node.js / CommonJS
 *   const SwedishCalendar = require('./swedish-calendar.js');
 *
 *   // Check whether today is a red day
 *   if (SwedishCalendar.isSwedishRedDay(new Date())) { ... }
 *
 *   // List all named days for 2026
 *   SwedishCalendar.getSwedishNamedDays(2026).forEach(day => {
 *     console.log(day.date, day.nameSv, day.kind);
 *   });
 *
 *   // Convert an ISO week triplet to a calendar date
 *   SwedishCalendar.getIsoDateFromWeek(44, 6, 2026);  // "2026-10-31"
 *
 * SUPPORTED INPUT FORMATS
 * ---------------------------------------------------------------------------
 * All functions that accept "input" take either a Date object or an ISO date
 * string in "YYYY-MM-DD" format (this is the Swedish standard date format).
 * Invalid input throws TypeError. Valid year range: 1583–9999 (Gregorian
 * calendar).
 *
 * ===============================================================================
 */

(function (root, factory) {
    'use strict';

    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS / Node.js
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else {
        // Browser global
        root.SwedishCalendar = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const EXTRA_WORK_FREE_EVES = new Set([
        'easter_eve',
        'midsummer_eve',
        'christmas_eve',
        'new_years_eve'
    ]);

    // Display priority when several named days share a date.
    const KIND_PRIORITY = {
        public_holiday: 0,
        eve: 1,
        observance: 2
    };

    // Per-year cache to avoid rebuilding the named-day map on every lookup.
    const NAMED_DAY_CACHE = new Map();

    // -- Public API -----------------------------------------------------------

    function getSwedishDayInfo(input) {
        const date = normalizeInputDate(input);
        const year = date.getUTCFullYear();
        const isoDate = toIsoDate(date);
        const dayOfWeek = date.getUTCDay();
        const isoWeekData = getIsoWeekData(date);

        const namedDays = buildNamedDaysMap(year).get(isoDate) ?? [];
        const primaryNamedDay = namedDays[0] ?? null;

        const isSaturday = dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;
        const isWeekend = isSaturday || isSunday;

        const isPublicHoliday = namedDays.some((day) => day.kind === 'public_holiday');
        const isRedDay = isSunday || isPublicHoliday;
        const isWorkFreeDay = computeWorkFree(namedDays, isSaturday, isRedDay);
        const isEve = namedDays.some((day) => day.kind === 'eve');

        // holidayType reflects the kind of named day only. For Sundays that
        // are not also named, use isSunday / isRedDay instead.
        const holidayType = primaryNamedDay !== null ? primaryNamedDay.kind : 'none';

        return {
            date: isoDate,
            year,
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            isoWeekYear: isoWeekData.isoWeekYear,
            isoWeek: isoWeekData.isoWeek,
            isoDayOfWeek: isoWeekData.isoDayOfWeek,
            dayOfWeek,
            dayNameSv: getSwedishWeekdayName(dayOfWeek),
            isSaturday,
            isSunday,
            isWeekend,
            isPublicHoliday,
            isRedDay,
            isWorkFreeDay,
            isEve,
            holidayName: primaryNamedDay ? primaryNamedDay.nameSv : null,
            holidayNames: namedDays.map((day) => day.nameSv),
            holidayType,
            nextDayIsWorkFree: isDateWorkFreeInternal(addDays(date, 1))
        };
    }

    function getSwedishDayInfoByIsoWeek(isoWeek, isoDayOfWeek, isoWeekYear) {
        return getSwedishDayInfo(getDateFromIsoWeek(isoWeek, isoDayOfWeek, isoWeekYear));
    }

    function getIsoDateFromWeek(isoWeek, isoDayOfWeek, isoWeekYear) {
        return toIsoDate(getDateFromIsoWeek(isoWeek, isoDayOfWeek, isoWeekYear));
    }

    function getDateFromIsoWeek(isoWeek, isoDayOfWeek, isoWeekYear) {
        validateYear(isoWeekYear);

        if (!Number.isInteger(isoWeek) || isoWeek < 1 || isoWeek > getIsoWeeksInYear(isoWeekYear)) {
            throw new TypeError('Invalid ISO week number for the given year.');
        }

        if (!Number.isInteger(isoDayOfWeek) || isoDayOfWeek < 1 || isoDayOfWeek > 7) {
            throw new TypeError('ISO weekday must be an integer between 1 and 7.');
        }

        const januaryFourth = createDate(isoWeekYear, 1, 4);
        const januaryFourthIsoDay = getIsoDayOfWeek(januaryFourth);
        const startOfIsoWeekOne = addDays(januaryFourth, 1 - januaryFourthIsoDay);

        return addDays(startOfIsoWeekOne, (isoWeek - 1) * 7 + (isoDayOfWeek - 1));
    }

    function getIsoWeeksInYear(year) {
        validateYear(year);
        return getIsoWeekData(createDate(year, 12, 28)).isoWeek;
    }

    function isSwedishPublicHoliday(input) {
        return getSwedishDayInfo(input).isPublicHoliday;
    }

    function isSwedishRedDay(input) {
        return getSwedishDayInfo(input).isRedDay;
    }

    function isSwedishWorkFreeDay(input) {
        return getSwedishDayInfo(input).isWorkFreeDay;
    }

    function isSwedishHolidayEve(input) {
        return getSwedishDayInfo(input).isEve;
    }

    function getSwedishNamedDays(year) {
        validateYear(year);
        return Array.from(buildNamedDaysMap(year).values())
            .flat()
            .map((day) => ({
                key: day.key,
                nameSv: day.nameSv,
                date: day.date,
                kind: day.kind
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    function getSwedishRedDays(year) {
        return collectMatchingDates(year, (d) => isSwedishRedDay(d));
    }

    function getSwedishWorkFreeDays(year) {
        return collectMatchingDates(year, (d) => isSwedishWorkFreeDay(d));
    }

    // -- Internal helpers -----------------------------------------------------

    // Internal work-free check that operates on a Date object directly.
    // Avoids recursion through getSwedishDayInfo (which calls this in turn).
    function isDateWorkFreeInternal(date) {
        const year = date.getUTCFullYear();

        // Only reachable via nextDayIsWorkFree for 9999-12-31: the following
        // day is January 1 of year 10000, which is Nyårsdagen and work-free.
        if (year > 9999) {
            return true;
        }

        const isoDate = toIsoDate(date);
        const namedDays = buildNamedDaysMap(year).get(isoDate) ?? [];
        const dayOfWeek = date.getUTCDay();
        const isSaturday = dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;
        const isPublicHoliday = namedDays.some((day) => day.kind === 'public_holiday');
        const isRedDay = isSunday || isPublicHoliday;
        return computeWorkFree(namedDays, isSaturday, isRedDay);
    }

    function computeWorkFree(namedDays, isSaturday, isRedDay) {
        return isRedDay || isSaturday || namedDays.some((day) => EXTRA_WORK_FREE_EVES.has(day.key));
    }

    function collectMatchingDates(year, predicate) {
        validateYear(year);
        const dates = [];
        let date = createDate(year, 1, 1);
        while (date.getUTCFullYear() === year) {
            if (predicate(date)) {
                dates.push(toIsoDate(date));
            }
            date = addDays(date, 1);
        }
        return dates;
    }

    function buildNamedDaysMap(year) {
        validateYear(year);

        const cached = NAMED_DAY_CACHE.get(year);
        if (cached) {
            return cached;
        }

        const easter = getEasterSunday(year);
        const midsummer = getMidsummerDay(year);
        const allSaints = getAllSaintsDay(year);

        const days = [
            namedDay('new_years_day', 'Nyårsdagen', createDate(year, 1, 1), 'public_holiday'),
            namedDay('twelfth_night_eve', 'Trettondagsafton', createDate(year, 1, 5), 'eve'),
            namedDay('epiphany', 'Trettondedag jul', createDate(year, 1, 6), 'public_holiday'),
            namedDay('maundy_thursday', 'Skärtorsdagen', addDays(easter, -3), 'eve'),
            namedDay('good_friday', 'Långfredagen', addDays(easter, -2), 'public_holiday'),
            namedDay('easter_eve', 'Påskafton', addDays(easter, -1), 'eve'),
            namedDay('easter_sunday', 'Påskdagen', easter, 'public_holiday'),
            namedDay('easter_monday', 'Annandag påsk', addDays(easter, 1), 'public_holiday'),
            namedDay('walpurgis_eve', 'Valborgsmässoafton', createDate(year, 4, 30), 'eve'),
            namedDay('may_day', 'Första maj', createDate(year, 5, 1), 'public_holiday'),
            namedDay(
                'ascension_day',
                'Kristi himmelsfärdsdag',
                addDays(easter, 39),
                'public_holiday'
            ),
            namedDay('pentecost_eve', 'Pingstafton', addDays(easter, 48), 'eve'),
            namedDay('pentecost_sunday', 'Pingstdagen', addDays(easter, 49), 'public_holiday'),
            namedDay(
                'whit_monday_observance',
                'Annandag pingst',
                addDays(easter, 50),
                'observance'
            ),
            namedDay(
                'national_day',
                'Sveriges nationaldag',
                createDate(year, 6, 6),
                'public_holiday'
            ),
            namedDay('midsummer_eve', 'Midsommarafton', addDays(midsummer, -1), 'eve'),
            namedDay('midsummer_day', 'Midsommardagen', midsummer, 'public_holiday'),
            namedDay('all_saints_eve', 'Allhelgonaafton', addDays(allSaints, -1), 'eve'),
            namedDay('all_saints_day', 'Alla helgons dag', allSaints, 'public_holiday'),
            namedDay('christmas_eve', 'Julafton', createDate(year, 12, 24), 'eve'),
            namedDay('christmas_day', 'Juldagen', createDate(year, 12, 25), 'public_holiday'),
            namedDay('boxing_day', 'Annandag jul', createDate(year, 12, 26), 'public_holiday'),
            namedDay('new_years_eve', 'Nyårsafton', createDate(year, 12, 31), 'eve')
        ];

        // Several named days can share a date (e.g. Kristi himmelsfärdsdag
        // fell on Första maj in 2008), so each date maps to a list, sorted
        // so the highest-priority kind comes first.
        const map = new Map();
        for (const day of days) {
            const existing = map.get(day.date);
            if (existing) {
                existing.push(day);
                existing.sort((a, b) => KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind]);
            } else {
                map.set(day.date, [day]);
            }
        }
        NAMED_DAY_CACHE.set(year, map);
        return map;
    }

    function namedDay(key, nameSv, date, kind) {
        return { key, nameSv, date: toIsoDate(date), kind };
    }

    // Meeus/Jones/Butcher — Gregorian Easter algorithm
    function getEasterSunday(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;

        return createDate(year, month, day);
    }

    // Midsummer Day: the Saturday between June 20 and June 26
    function getMidsummerDay(year) {
        for (let day = 20; day <= 26; day += 1) {
            const date = createDate(year, 6, day);
            if (date.getUTCDay() === 6) {
                return date;
            }
        }
        throw new TypeError('Could not calculate Midsummer Day.');
    }

    // All Saints' Day: the Saturday between October 31 and November 6
    function getAllSaintsDay(year) {
        for (let offset = 0; offset <= 6; offset += 1) {
            const date = addDays(createDate(year, 10, 31), offset);
            if (date.getUTCDay() === 6) {
                return date;
            }
        }
        throw new TypeError("Could not calculate All Saints' Day.");
    }

    function getIsoWeekData(date) {
        const isoDayOfWeek = getIsoDayOfWeek(date);
        const thursday = addDays(date, 4 - isoDayOfWeek);
        const isoWeekYear = thursday.getUTCFullYear();
        const januaryFirst = createDate(isoWeekYear, 1, 1);
        const dayDifference = Math.floor((thursday.getTime() - januaryFirst.getTime()) / 86400000);
        const isoWeek = Math.floor(dayDifference / 7) + 1;

        return { isoWeekYear, isoWeek, isoDayOfWeek };
    }

    function getIsoDayOfWeek(date) {
        const day = date.getUTCDay();
        return day === 0 ? 7 : day;
    }

    // Returns Swedish weekday names — intentionally Swedish because the
    // library targets Swedish users and domain vocabulary.
    function getSwedishWeekdayName(dayOfWeek) {
        const names = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
        return names[dayOfWeek] ?? '';
    }

    function addDays(date, days) {
        const result = new Date(date.getTime());
        result.setUTCDate(result.getUTCDate() + days);
        return result;
    }

    function createDate(year, month, day) {
        return new Date(Date.UTC(year, month - 1, day));
    }

    // ISO 8601 date format — this is also the Swedish standard date format.
    function toIsoDate(date) {
        return date.toISOString().slice(0, 10);
    }

    function normalizeInputDate(input) {
        if (input instanceof Date) {
            if (Number.isNaN(input.getTime())) {
                throw new TypeError('Invalid Date object.');
            }
            return createDate(input.getUTCFullYear(), input.getUTCMonth() + 1, input.getUTCDate());
        }

        if (typeof input === 'string') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
                throw new TypeError('Date string must use the format YYYY-MM-DD.');
            }
            const [yearString, monthString, dayString] = input.split('-');
            const year = Number.parseInt(yearString, 10);
            const month = Number.parseInt(monthString, 10);
            const day = Number.parseInt(dayString, 10);
            const date = createDate(year, month, day);

            if (
                date.getUTCFullYear() !== year ||
                date.getUTCMonth() + 1 !== month ||
                date.getUTCDate() !== day
            ) {
                throw new TypeError('Invalid calendar date.');
            }
            return date;
        }

        throw new TypeError('Input must be a Date object or an ISO date string.');
    }

    function validateYear(year) {
        if (!Number.isInteger(year) || year < 1583 || year > 9999) {
            throw new TypeError('Year must be an integer between 1583 and 9999.');
        }
    }

    // -- Export ---------------------------------------------------------------

    return {
        getSwedishDayInfo,
        getSwedishDayInfoByIsoWeek,
        getIsoDateFromWeek,
        getDateFromIsoWeek,
        getIsoWeeksInYear,
        isSwedishPublicHoliday,
        isSwedishRedDay,
        isSwedishWorkFreeDay,
        isSwedishHolidayEve,
        getSwedishNamedDays,
        getSwedishRedDays,
        getSwedishWorkFreeDays
    };
});
