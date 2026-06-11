'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const SwedishCalendar = require('../src/swedish-calendar.js');

// -- Easter ------------------------------------------------------------------

test('Easter Sunday matches known dates', () => {
    const knownEasters = {
        2000: '2000-04-23',
        2008: '2008-03-23',
        2011: '2011-04-24',
        2016: '2016-03-27',
        2024: '2024-03-31',
        2025: '2025-04-20',
        2026: '2026-04-05',
        2038: '2038-04-25',
        2049: '2049-04-18'
    };

    for (const [year, expected] of Object.entries(knownEasters)) {
        const easter = SwedishCalendar.getSwedishNamedDays(Number(year)).find(
            (day) => day.key === 'easter_sunday'
        );
        assert.equal(easter.date, expected, `Easter ${year}`);
    }
});

// -- Floating holidays ---------------------------------------------------------

test('Midsummer Day is the Saturday between June 20 and 26', () => {
    const expected = {
        2024: '2024-06-22',
        2025: '2025-06-21',
        2026: '2026-06-20'
    };

    for (const [year, date] of Object.entries(expected)) {
        const midsummer = SwedishCalendar.getSwedishNamedDays(Number(year)).find(
            (day) => day.key === 'midsummer_day'
        );
        assert.equal(midsummer.date, date, `Midsummer ${year}`);
    }
});

test("All Saints' Day is the Saturday between Oct 31 and Nov 6", () => {
    const expected = {
        2024: '2024-11-02',
        2025: '2025-11-01',
        2026: '2026-10-31'
    };

    for (const [year, date] of Object.entries(expected)) {
        const allSaints = SwedishCalendar.getSwedishNamedDays(Number(year)).find(
            (day) => day.key === 'all_saints_day'
        );
        assert.equal(allSaints.date, date, `All Saints ${year}`);
    }
});

// -- Named days ----------------------------------------------------------------

test('getSwedishNamedDays(2026) lists all 23 named days with correct dates', () => {
    const days = SwedishCalendar.getSwedishNamedDays(2026);
    const byKey = new Map(days.map((day) => [day.key, day]));

    assert.equal(days.length, 23);
    assert.equal(byKey.get('new_years_day').date, '2026-01-01');
    assert.equal(byKey.get('twelfth_night_eve').date, '2026-01-05');
    assert.equal(byKey.get('epiphany').date, '2026-01-06');
    assert.equal(byKey.get('maundy_thursday').date, '2026-04-02');
    assert.equal(byKey.get('good_friday').date, '2026-04-03');
    assert.equal(byKey.get('easter_eve').date, '2026-04-04');
    assert.equal(byKey.get('easter_sunday').date, '2026-04-05');
    assert.equal(byKey.get('easter_monday').date, '2026-04-06');
    assert.equal(byKey.get('walpurgis_eve').date, '2026-04-30');
    assert.equal(byKey.get('may_day').date, '2026-05-01');
    assert.equal(byKey.get('ascension_day').date, '2026-05-14');
    assert.equal(byKey.get('pentecost_eve').date, '2026-05-23');
    assert.equal(byKey.get('pentecost_sunday').date, '2026-05-24');
    assert.equal(byKey.get('whit_monday_observance').date, '2026-05-25');
    assert.equal(byKey.get('national_day').date, '2026-06-06');
    assert.equal(byKey.get('midsummer_eve').date, '2026-06-19');
    assert.equal(byKey.get('midsummer_day').date, '2026-06-20');
    assert.equal(byKey.get('all_saints_eve').date, '2026-10-30');
    assert.equal(byKey.get('all_saints_day').date, '2026-10-31');
    assert.equal(byKey.get('christmas_eve').date, '2026-12-24');
    assert.equal(byKey.get('christmas_day').date, '2026-12-25');
    assert.equal(byKey.get('boxing_day').date, '2026-12-26');
    assert.equal(byKey.get('new_years_eve').date, '2026-12-31');
});

test('getSwedishNamedDays is sorted by date', () => {
    const days = SwedishCalendar.getSwedishNamedDays(2026);
    const dates = days.map((day) => day.date);
    assert.deepEqual(dates, [...dates].sort());
});

// -- Colliding named days --------------------------------------------------------

test('2008: Kristi himmelsfärdsdag and Första maj share May 1 and both are kept', () => {
    const days = SwedishCalendar.getSwedishNamedDays(2008).filter(
        (day) => day.date === '2008-05-01'
    );

    assert.equal(days.length, 2);
    assert.deepEqual(days.map((day) => day.key).sort(), ['ascension_day', 'may_day']);

    const info = SwedishCalendar.getSwedishDayInfo('2008-05-01');
    assert.equal(info.isPublicHoliday, true);
    assert.equal(info.isRedDay, true);
    assert.equal(info.holidayNames.length, 2);
    assert.ok(info.holidayNames.includes('Första maj'));
    assert.ok(info.holidayNames.includes('Kristi himmelsfärdsdag'));
});

test('2049: Pingstdagen falls on Sveriges nationaldag and both are kept', () => {
    const days = SwedishCalendar.getSwedishNamedDays(2049).filter(
        (day) => day.date === '2049-06-06'
    );

    assert.deepEqual(days.map((day) => day.key).sort(), ['national_day', 'pentecost_sunday']);

    const info = SwedishCalendar.getSwedishDayInfo('2049-06-06');
    assert.equal(info.isPublicHoliday, true);
    assert.equal(info.holidayNames.length, 2);
});

test('2033: public holiday takes display priority over observance on June 6', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2033-06-06');
    assert.equal(info.holidayName, 'Sveriges nationaldag');
    assert.equal(info.holidayType, 'public_holiday');
    assert.deepEqual(info.holidayNames, ['Sveriges nationaldag', 'Annandag pingst']);
});

test('1818: Kristi himmelsfärdsdag on Valborgsmässoafton sets both flags', () => {
    // Easter 1818 fell on March 22, putting Ascension Day on April 30.
    const info = SwedishCalendar.getSwedishDayInfo('1818-04-30');
    assert.equal(info.isPublicHoliday, true);
    assert.equal(info.isEve, true);
    assert.equal(info.holidayName, 'Kristi himmelsfärdsdag');
    assert.deepEqual([...info.holidayNames].sort(), [
        'Kristi himmelsfärdsdag',
        'Valborgsmässoafton'
    ]);
});

// -- Day classification -----------------------------------------------------------

test('Julafton is work-free but not a red day', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2026-12-24');
    assert.equal(info.holidayName, 'Julafton');
    assert.equal(info.holidayType, 'eve');
    assert.equal(info.isEve, true);
    assert.equal(info.isPublicHoliday, false);
    assert.equal(info.isRedDay, false);
    assert.equal(info.isWorkFreeDay, true);
    assert.equal(info.nextDayIsWorkFree, true);
});

test('Juldagen is a public holiday and red day', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2026-12-25');
    assert.equal(info.holidayName, 'Juldagen');
    assert.equal(info.isPublicHoliday, true);
    assert.equal(info.isRedDay, true);
    assert.equal(info.isWorkFreeDay, true);
});

test('plain Sunday is a red day but has no holiday name', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2026-01-11');
    assert.equal(info.isSunday, true);
    assert.equal(info.isRedDay, true);
    assert.equal(info.isWorkFreeDay, true);
    assert.equal(info.holidayName, null);
    assert.deepEqual(info.holidayNames, []);
    assert.equal(info.holidayType, 'none');
});

test('plain Saturday is work-free but not red', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2026-01-10');
    assert.equal(info.isSaturday, true);
    assert.equal(info.isRedDay, false);
    assert.equal(info.isWorkFreeDay, true);
});

test('plain weekday is neither red nor work-free', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2026-01-13');
    assert.equal(info.isWeekend, false);
    assert.equal(info.isRedDay, false);
    assert.equal(info.isWorkFreeDay, false);
    assert.equal(info.dayNameSv, 'Tisdag');
});

test('Skärtorsdagen is an eve but not work-free', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2026-04-02');
    assert.equal(info.holidayName, 'Skärtorsdagen');
    assert.equal(info.isEve, true);
    assert.equal(info.isWorkFreeDay, false);
    assert.equal(info.nextDayIsWorkFree, true); // Långfredagen
});

test('Annandag pingst is an observance, not a public holiday', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2026-05-25');
    assert.equal(info.holidayName, 'Annandag pingst');
    assert.equal(info.holidayType, 'observance');
    assert.equal(info.isPublicHoliday, false);
    assert.equal(info.isRedDay, false);
});

test('boolean helpers agree with getSwedishDayInfo', () => {
    assert.equal(SwedishCalendar.isSwedishPublicHoliday('2026-12-25'), true);
    assert.equal(SwedishCalendar.isSwedishPublicHoliday('2026-12-24'), false);
    assert.equal(SwedishCalendar.isSwedishRedDay('2026-12-25'), true);
    assert.equal(SwedishCalendar.isSwedishRedDay('2026-12-24'), false);
    assert.equal(SwedishCalendar.isSwedishWorkFreeDay('2026-12-24'), true);
    assert.equal(SwedishCalendar.isSwedishWorkFreeDay('2026-12-22'), false);
    assert.equal(SwedishCalendar.isSwedishHolidayEve('2026-12-24'), true);
    assert.equal(SwedishCalendar.isSwedishHolidayEve('2026-12-25'), false);
});

// -- Year lists --------------------------------------------------------------------

test('getSwedishRedDays(2026) returns every Sunday and public holiday', () => {
    const redDays = SwedishCalendar.getSwedishRedDays(2026);
    assert.equal(redDays.length, 63);
    assert.ok(redDays.includes('2026-12-25'));
    assert.ok(redDays.includes('2026-06-06'));
    assert.ok(!redDays.includes('2026-12-24'));
    assert.deepEqual(redDays, [...redDays].sort());
});

test('getSwedishWorkFreeDays includes the extra work-free eves', () => {
    const workFree = SwedishCalendar.getSwedishWorkFreeDays(2026);
    assert.ok(workFree.includes('2026-04-04')); // Påskafton
    assert.ok(workFree.includes('2026-06-19')); // Midsommarafton
    assert.ok(workFree.includes('2026-12-24')); // Julafton
    assert.ok(workFree.includes('2026-12-31')); // Nyårsafton
    assert.ok(!workFree.includes('2026-04-30')); // Valborgsmässoafton (a Thursday)
});

// -- ISO weeks ------------------------------------------------------------------

test('getIsoWeeksInYear returns 52 or 53 correctly', () => {
    assert.equal(SwedishCalendar.getIsoWeeksInYear(2020), 53);
    assert.equal(SwedishCalendar.getIsoWeeksInYear(2024), 52);
    assert.equal(SwedishCalendar.getIsoWeeksInYear(2025), 52);
    assert.equal(SwedishCalendar.getIsoWeeksInYear(2026), 53);
});

test('getIsoDateFromWeek converts ISO week triplets to dates', () => {
    assert.equal(SwedishCalendar.getIsoDateFromWeek(1, 1, 2026), '2025-12-29');
    assert.equal(SwedishCalendar.getIsoDateFromWeek(53, 7, 2026), '2027-01-03');
    assert.equal(SwedishCalendar.getIsoDateFromWeek(44, 6, 2026), '2026-10-31');
    assert.equal(SwedishCalendar.getIsoDateFromWeek(1, 1, 2024), '2024-01-01');
});

test('getDateFromIsoWeek returns a UTC midnight Date', () => {
    const date = SwedishCalendar.getDateFromIsoWeek(44, 6, 2026);
    assert.equal(date.toISOString(), '2026-10-31T00:00:00.000Z');
});

test('getSwedishDayInfoByIsoWeek matches getSwedishDayInfo', () => {
    const byWeek = SwedishCalendar.getSwedishDayInfoByIsoWeek(25, 5, 2026);
    assert.equal(byWeek.date, '2026-06-19');
    assert.equal(byWeek.holidayName, 'Midsommarafton');
    assert.deepEqual(byWeek, SwedishCalendar.getSwedishDayInfo('2026-06-19'));
});

test('ISO week fields round-trip through getSwedishDayInfo', () => {
    const info = SwedishCalendar.getSwedishDayInfo('2026-12-24');
    assert.equal(info.isoWeekYear, 2026);
    assert.equal(info.isoWeek, 52);
    assert.equal(info.isoDayOfWeek, 4);

    // January 1, 2027 belongs to ISO week 53 of 2026.
    const newYear = SwedishCalendar.getSwedishDayInfo('2027-01-01');
    assert.equal(newYear.isoWeekYear, 2026);
    assert.equal(newYear.isoWeek, 53);
});

// -- Input handling ----------------------------------------------------------------

test('accepts Date objects and normalizes them by UTC date', () => {
    const info = SwedishCalendar.getSwedishDayInfo(new Date(Date.UTC(2026, 11, 24, 15, 30)));
    assert.equal(info.date, '2026-12-24');
    assert.equal(info.holidayName, 'Julafton');
});

test('rejects invalid input with TypeError', () => {
    assert.throws(() => SwedishCalendar.getSwedishDayInfo('2026-02-30'), TypeError);
    assert.throws(() => SwedishCalendar.getSwedishDayInfo('2026-13-01'), TypeError);
    assert.throws(() => SwedishCalendar.getSwedishDayInfo('2026-1-1'), TypeError);
    assert.throws(() => SwedishCalendar.getSwedishDayInfo('not a date'), TypeError);
    assert.throws(() => SwedishCalendar.getSwedishDayInfo(new Date(NaN)), TypeError);
    assert.throws(() => SwedishCalendar.getSwedishDayInfo(42), TypeError);
    assert.throws(() => SwedishCalendar.getSwedishDayInfo(null), TypeError);
});

test('rejects years outside 1583-9999', () => {
    assert.throws(() => SwedishCalendar.getSwedishDayInfo('1582-12-31'), TypeError);
    assert.throws(() => SwedishCalendar.getSwedishNamedDays(1582), TypeError);
    assert.throws(() => SwedishCalendar.getSwedishNamedDays(10000), TypeError);
    assert.throws(() => SwedishCalendar.getIsoWeeksInYear(1.5), TypeError);
});

test('rejects invalid ISO week triplets', () => {
    assert.throws(() => SwedishCalendar.getIsoDateFromWeek(0, 1, 2026), TypeError);
    assert.throws(() => SwedishCalendar.getIsoDateFromWeek(54, 1, 2026), TypeError);
    assert.throws(() => SwedishCalendar.getIsoDateFromWeek(53, 1, 2025), TypeError); // 2025 has 52 weeks
    assert.throws(() => SwedishCalendar.getIsoDateFromWeek(1, 0, 2026), TypeError);
    assert.throws(() => SwedishCalendar.getIsoDateFromWeek(1, 8, 2026), TypeError);
});

// -- Supported range edges ------------------------------------------------------------

test('handles the edges of the supported year range', () => {
    const first = SwedishCalendar.getSwedishDayInfo('1583-01-01');
    assert.equal(first.holidayName, 'Nyårsdagen');

    // 9999-12-31 must not throw even though the next day is out of range.
    const last = SwedishCalendar.getSwedishDayInfo('9999-12-31');
    assert.equal(last.holidayName, 'Nyårsafton');
    assert.equal(last.nextDayIsWorkFree, true);

    const redDays9999 = SwedishCalendar.getSwedishRedDays(9999);
    assert.ok(redDays9999.includes('9999-12-25'));
});
