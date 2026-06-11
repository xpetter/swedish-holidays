/**
 * ESM entry point for SwedishCalendar.
 *
 * Re-exports the UMD/CommonJS implementation in swedish-calendar.js as both
 * named exports and a default export:
 *
 *   import SwedishCalendar from 'swedish-holidays';
 *   import { getSwedishDayInfo } from 'swedish-holidays';
 */

import SwedishCalendar from './swedish-calendar.js';

export const {
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
} = SwedishCalendar;

export default SwedishCalendar;
