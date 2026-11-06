import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, decode, validate, hex, contrast, passes, toPx, tokens, css, inline, safeHref, skipReading } from './state.mjs';
test('preferences round trip independently of the source book', () => assert.deepEqual(decode(JSON.stringify(defaults())), defaults()));
test('reject malformed or future preferences', () => { for (const s of ['{', 'null', '{"version":2}']) assert.throws(() => decode(s)); });
test('numeric limits cannot inject CSS or overflow the reader', () => { for (const size of [0, 3, NaN, '1;display:none']) assert.throws(() => validate({ ...defaults(), size })); });
test('unknown font names and palette keys cannot become executable CSS', () => { assert.throws(() => validate({ ...defaults(), font: 'url(evil)' })); assert.throws(() => hex('red;display:none')); });
test('contrast endpoints and threshold use unrounded values', () => { assert.equal(contrast('#000000', '#FFFFFF'), 21); assert.equal(contrast('#FFFFFF', '#FFFFFF'), 1); assert.equal(passes(4.499), false); assert.equal(passes(4.5), true); });
test('actual root controls conversion; display unit does not change size', () => { assert.equal(toPx(1.25, 16), 20); assert.equal(toPx(1.25, 20), 25); assert.throws(() => toPx(1, 0)); const v = defaults(); assert.deepEqual(tokens(v), tokens({ ...v, units: 'px' })); });
test('source light and dark foregrounds pass text contrast', () => { assert(passes(contrast('#000000', '#FFFFFF'))); assert(passes(contrast('#EDEEF0', '#111113'))); });
test('token export preserves Mercury RGB channel format and experiment status', () => { const t = tokens(defaults()); assert.equal(t.colors['--fg-brand'], '78 70 180'); assert.equal(t.status, 'reader-experiment'); assert.match(css(defaults()), /rgb\(var\(--fg-primary\)\)/); });
test('inline book content preserves code, emphasis and links as data', () => { assert.deepEqual(inline('**Guide** `mx` [W3C](https://www.w3.org/)').map(x => x.type), ['strong', 'text', 'code', 'text', 'link']); assert.equal(inline('<script>bad()</script>')[0].type, 'text'); });
test('unsafe links are not active', () => { for (const u of ['javascript:alert(1)', 'data:text/html,hi', 'http://example.com', 'https://a/"bad']) assert.equal(safeHref(u), null); });

test('skip reading focuses the current heading without following a different chapter fragment', () => {
  const calls = []; const heading = { focus: () => calls.push('focus'), scrollIntoView: options => calls.push(options.block) };
  skipReading({button: 0, preventDefault: () => calls.push('prevent')}, heading);
  assert.deepEqual(calls, ['prevent', 'focus', 'start']);
  for (const modifier of ['metaKey','ctrlKey','shiftKey','altKey','defaultPrevented']) {
    calls.length = 0; skipReading({[modifier]: true, preventDefault: () => calls.push('prevent')}, heading); assert.deepEqual(calls, []);
  }
  calls.length = 0; skipReading({button: 1, preventDefault: () => calls.push('prevent')}, heading); assert.deepEqual(calls, []);
  skipReading({preventDefault: () => assert.fail('missing destination must keep native fallback')}, null);
});
