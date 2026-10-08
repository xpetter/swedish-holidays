import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import * as esm from 'swedish-holidays';

const require = createRequire(import.meta.url);
const commonjs = require('swedish-holidays');
const source = readFileSync(new URL('../src/swedish-calendar.js', import.meta.url), 'utf8');
const argumentsByName = {
    getSwedishDayInfo: ['2008-05-01'],
    getSwedishDayInfoByIsoWeek: [25, 5, 2026],
    getIsoDateFromWeek: [25, 5, 2026],
    getDateFromIsoWeek: [25, 5, 2026],
    getIsoWeeksInYear: [2026],
    isSwedishPublicHoliday: ['2026-12-25'],
    isSwedishRedDay: ['2026-12-25'],
    isSwedishWorkFreeDay: ['2026-12-24'],
    isSwedishHolidayEve: ['2026-12-24'],
    getSwedishNamedDays: [2026],
    getSwedishRedDays: [2026],
    getSwedishWorkFreeDays: [2026]
};

function checkApi(api) {
    assert.deepEqual(Object.keys(api).sort(), Object.keys(argumentsByName).sort());
    for (const [name, args] of Object.entries(argumentsByName)) {
        assert.equal(typeof api[name], 'function', name);
        assert.equal(
            JSON.stringify(api[name](...args)),
            JSON.stringify(commonjs[name](...args)),
            name
        );
    }
}

test('package ESM exports preserve every CommonJS API', () => {
    checkApi(esm.default);
    assert.deepEqual(Object.keys(esm).sort(), ['default', ...Object.keys(commonjs)].sort());
    for (const name of Object.keys(commonjs)) {
        assert.equal(esm[name], esm.default[name], name);
    }
});

test('browser global and AMD preserve every API', () => {
    const context = { self: {} };
    runInNewContext(source, context);
    checkApi(context.self.SwedishCalendar);
    let amd;
    const define = (dependencies, factory) => {
        assert.equal(dependencies.length, 0);
        amd = factory();
    };
    define.amd = {};
    runInNewContext(source, { define });
    checkApi(amd);
});

test('ESM dependency graph loads with browser module semantics and no CommonJS globals', () => {
    const entry = new URL('../src/swedish-calendar.mjs', import.meta.url).href;
    const result = spawnSync(
        process.execPath,
        [
            '--experimental-vm-modules',
            '--input-type=module',
            '-e',
            `
            import { readFileSync } from 'node:fs';
            import { createContext, SourceTextModule } from 'node:vm';
            import assert from 'node:assert/strict';
            const context = createContext({});
            const modules = new Map();
            function load(url) {
                if (!modules.has(url)) {
                    modules.set(url, new SourceTextModule(readFileSync(new URL(url), 'utf8'), {
                        context,
                        identifier: url
                    }));
                }
                return modules.get(url);
            }
            const module = load(${JSON.stringify(entry)});
            await module.link((specifier, parent) => load(new URL(specifier, parent.identifier).href));
            await module.evaluate();
            const api = module.namespace.default;
            const argsByName = ${JSON.stringify(argumentsByName)};
            const expected = ${JSON.stringify(
                Object.fromEntries(
                    Object.entries(argumentsByName).map(([name, args]) => [
                        name,
                        JSON.stringify(commonjs[name](...args))
                    ])
                )
            )};
            assert.deepEqual(Object.keys(module.namespace).sort(), ['default', ...Object.keys(argsByName)].sort());
            for (const [name, args] of Object.entries(argsByName)) {
                assert.equal(module.namespace[name], api[name], name);
                assert.equal(JSON.stringify(api[name](...args)), expected[name], name);
            }
            assert.equal('SwedishCalendar' in context, false);
            `
        ],
        { encoding: 'utf8' }
    );
    assert.equal(result.status, 0, result.stderr || String(result.error));
});
