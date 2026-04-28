/**
 * Smoke tests for prism-ontap-cli
 *
 * Verifies that the language definition registers correctly and that
 * the key token types appear in the output for representative ONTAP CLI text.
 *
 * Run: npm test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import Prism from 'prismjs';
import defineOntapCli from '../src/prism-ontap-cli.js';

// Register the language once for all tests.
defineOntapCli(Prism);

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns a flat list of all token types present in a tokenized stream,
 * recursing into `inside` content.
 * @param {Array} tokens
 * @returns {string[]}
 */
function collectTypes(tokens) {
  const types = [];
  for (const token of tokens) {
    if (typeof token === 'string') continue;
    types.push(token.type);
    if (token.content && typeof token.content !== 'string') {
      types.push(...collectTypes(
        Array.isArray(token.content) ? token.content : [token.content]
      ));
    }
  }
  return types;
}

/**
 * Returns a flat list of { type, text } for all leaf tokens.
 * @param {Array} tokens
 * @returns {{ type: string, text: string }[]}
 */
function collectLeaves(tokens) {
  const leaves = [];
  for (const token of tokens) {
    if (typeof token === 'string') continue;
    const content = token.content;
    if (typeof content === 'string') {
      leaves.push({ type: token.type, text: content });
    } else if (Array.isArray(content)) {
      leaves.push(...collectLeaves(content));
    }
  }
  return leaves;
}

function tokenize(code) {
  return Prism.tokenize(code, Prism.languages['ontap-cli']);
}

// ── Language registration ────────────────────────────────────────────────────

test('language ontap-cli is registered', () => {
  assert.ok(
    Prism.languages['ontap-cli'],
    'Prism.languages["ontap-cli"] should be defined after calling defineOntapCli()'
  );
});

// ── Prompt tokens ────────────────────────────────────────────────────────────

test('standard prompt is tokenized as ontap-prompt', () => {
  const tokens = tokenize('cluster1::> volume show');
  const leaves = collectLeaves(tokens);
  const prompt = leaves.find(l => l.type === 'ontap-prompt');
  assert.ok(prompt, 'Should produce an ontap-prompt token');
  assert.equal(prompt.text, 'cluster1::>');
});

test('elevated prompt is tokenized as ontap-prompt-elevated', () => {
  const tokens = tokenize('cluster1::*> set advanced');
  const leaves = collectLeaves(tokens);
  const elevated = leaves.find(l => l.type === 'ontap-prompt-elevated');
  assert.ok(elevated, 'Should produce an ontap-prompt-elevated token');
  assert.equal(elevated.text, 'cluster1::*>');
});

test('vserver context prompt is tokenized as ontap-prompt', () => {
  const tokens = tokenize('vs1::> vserver show');
  const leaves = collectLeaves(tokens);
  const prompt = leaves.find(l => l.type === 'ontap-prompt');
  assert.ok(prompt, 'Should produce an ontap-prompt token for vserver context');
  assert.equal(prompt.text, 'vs1::>');
});

// ── Command name ─────────────────────────────────────────────────────────────

test('single-word command is tokenized as ontap-command', () => {
  const tokens = tokenize('cluster1::> version');
  const leaves = collectLeaves(tokens);
  const cmd = leaves.find(l => l.type === 'ontap-command');
  assert.ok(cmd, 'Should produce an ontap-command token');
  assert.equal(cmd.text, 'version');
});

test('multi-word command is tokenized as a single ontap-command', () => {
  const tokens = tokenize('cluster1::> security audit log show');
  const leaves = collectLeaves(tokens);
  const cmd = leaves.find(l => l.type === 'ontap-command');
  assert.ok(cmd, 'Should produce an ontap-command token');
  assert.equal(cmd.text, 'security audit log show');
});

test('command is separate from param values', () => {
  const tokens = tokenize('cluster1::> security audit log show -role admin');
  const leaves = collectLeaves(tokens);
  const cmd = leaves.find(l => l.type === 'ontap-command');
  assert.ok(cmd, 'Should produce an ontap-command token');
  assert.equal(cmd.text, 'security audit log show', 'Command should not include value words');
});

// ── Parameters ───────────────────────────────────────────────────────────────

test('parameter flag is tokenized as ontap-param', () => {
  const tokens = tokenize('cluster1::> volume show -vserver vs1');
  const leaves = collectLeaves(tokens);
  const param = leaves.find(l => l.type === 'ontap-param');
  assert.ok(param, 'Should produce an ontap-param token');
  assert.equal(param.text, '-vserver');
});

test('multiple parameters are all tokenized as ontap-param', () => {
  const tokens = tokenize('cluster1::> volume show -vserver vs1 -state online');
  const leaves = collectLeaves(tokens);
  const params = leaves.filter(l => l.type === 'ontap-param');
  assert.equal(params.length, 2, 'Should produce two ontap-param tokens');
  assert.equal(params[0].text, '-vserver');
  assert.equal(params[1].text, '-state');
});

// ── Values ───────────────────────────────────────────────────────────────────

test('plain text value is tokenized as ontap-value', () => {
  const tokens = tokenize('cluster1::> security audit log show -role admin');
  const leaves = collectLeaves(tokens);
  const value = leaves.find(l => l.type === 'ontap-value');
  assert.ok(value, 'Should produce an ontap-value token');
  assert.equal(value.text, 'admin');
});

test('boolean value is tokenized as ontap-boolean', () => {
  const tokens = tokenize('cluster1::> network interface show -status-oper up');
  const leaves = collectLeaves(tokens);
  const bool = leaves.find(l => l.type === 'ontap-boolean');
  assert.ok(bool, 'Should produce an ontap-boolean token');
  assert.equal(bool.text, 'up');
});

test('IP address is tokenized as ontap-ip', () => {
  const tokens = tokenize('cluster1::> security audit log show -location 10.60.250.79');
  const leaves = collectLeaves(tokens);
  const ip = leaves.find(l => l.type === 'ontap-ip');
  assert.ok(ip, 'Should produce an ontap-ip token');
  assert.equal(ip.text, '10.60.250.79');
});

test('storage size is tokenized as ontap-size', () => {
  const tokens = tokenize('cluster1::> volume create vol1 -aggregate aggr1 -size 100GB');
  const leaves = collectLeaves(tokens);
  const size = leaves.find(l => l.type === 'ontap-size');
  assert.ok(size, 'Should produce an ontap-size token');
  assert.equal(size.text, '100GB');
});

test('quoted string value is tokenized as ontap-string', () => {
  const tokens = tokenize('cluster1::> security audit log show -timestamp "Mon Jan 03 18:37:05 2022"');
  const leaves = collectLeaves(tokens);
  const str = leaves.find(l => l.type === 'ontap-string');
  assert.ok(str, 'Should produce an ontap-string token');
  assert.equal(str.text, '"Mon Jan 03 18:37:05 2022"');
});

// ── Output tokens ────────────────────────────────────────────────────────────

test('separator line is tokenized as ontap-output-separator', () => {
  const tokens = tokenize('Vserver   Volume\n--------- --------\nvs1       vol1');
  const types = collectTypes(tokens);
  assert.ok(
    types.includes('ontap-output-separator'),
    'Should produce an ontap-output-separator token'
  );
});

test('header line is tokenized as ontap-output-header', () => {
  const tokens = tokenize('Vserver   Volume\n--------- --------\nvs1       vol1');
  const types = collectTypes(tokens);
  assert.ok(
    types.includes('ontap-output-header'),
    'Should produce an ontap-output-header token'
  );
});

test('count line is tokenized as ontap-output-count', () => {
  const tokens = tokenize('2 entries were displayed.');
  const types = collectTypes(tokens);
  assert.ok(
    types.includes('ontap-output-count'),
    'Should produce an ontap-output-count token'
  );
});

test('singular entry count is tokenized as ontap-output-count', () => {
  const tokens = tokenize('1 entry was displayed.');
  const types = collectTypes(tokens);
  assert.ok(
    types.includes('ontap-output-count'),
    'Should produce an ontap-output-count token for singular form'
  );
});
