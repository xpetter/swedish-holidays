import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const workflowDirectory = new URL('../.github/workflows/', import.meta.url);

test('external workflow actions use immutable commit SHAs', () => {
    const workflows = readdirSync(workflowDirectory).filter((name) => /\.ya?ml$/.test(name));
    assert.ok(workflows.length > 0, 'Expected at least one workflow to validate');

    for (const name of workflows) {
        const content = readFileSync(new URL(name, workflowDirectory), 'utf8');
        const references = content.matchAll(/^\s*(?:-\s*)?uses:\s*['"]?([^\s'"#]+)/gm);

        for (const [, reference] of references) {
            if (reference.startsWith('./')) {
                continue;
            }

            assert.match(
                reference,
                /^[^@\s]+@[a-fA-F0-9]{40}$/,
                name + ': ' + reference + ' must reference a full 40-character commit SHA'
            );
        }
    }
});

test('CI uses read-only permissions and does not persist checkout credentials', () => {
    const workflow = readFileSync(new URL('ci.yml', workflowDirectory), 'utf8');

    assert.match(workflow, /^permissions:\r?\n  contents: read$/m);
    assert.match(
        workflow,
        /- uses: actions\/checkout@[a-fA-F0-9]{40}[^\n]*\r?\n\s+with:\r?\n\s+persist-credentials: false/m
    );
});
