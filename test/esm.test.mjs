import { test } from 'node:test';
import assert from 'node:assert/strict';

import SwedishCalendar, {
    getSwedishDayInfo,
    isSwedishRedDay,
    getSwedishNamedDays
} from '../src/swedish-calendar.mjs';

test('ESM named exports work', () => {
    assert.equal(getSwedishDayInfo('2026-12-24').holidayName, 'Julafton');
    assert.equal(isSwedishRedDay('2026-12-25'), true);
    assert.equal(getSwedishNamedDays(2026).length, 23);
});

test('ESM default export exposes the full API', () => {
    assert.equal(typeof SwedishCalendar.getSwedishDayInfo, 'function');
    assert.equal(typeof SwedishCalendar.getIsoWeeksInYear, 'function');
    assert.equal(
        SwedishCalendar.getSwedishDayInfo('2026-06-06').holidayName,
        'Sveriges nationaldag'
    );
});
