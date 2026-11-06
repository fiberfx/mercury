import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { russian, locale, translate, chapterIds, bookHref, docsHref, sourceHref, resultCount, emptyResults, specimenSvg } from './i18n.mjs';
import { defaults } from './state.mjs';
test('both locales preserve every chapter and lab when switching spaces', () => {
  for (const id of [...chapterIds, 'lab']) {
    assert.equal(bookHref('ru', '#' + id), '/ru/book#' + id);
    assert.equal(bookHref('en', id), '/book#' + id);
  }
  assert(chapterIds.includes('rhythm'));
  assert.equal(docsHref('ru'), '/ru/start'); assert.equal(docsHref('en'), '/start');
  assert.equal(sourceHref('ru'), '/book/mercury-brand-book.ru.md');
});
test('unsupported locale and untrusted chapter cannot become a destination', () => {
  assert.equal(locale('fr'), 'en');
  for (const hash of ['javascript:alert(1)', '//evil.example', 'unknown', 'character?lang=ru']) assert.equal(bookHref('ru', hash), '/ru/book');
});
test('visible and accessible reader messages have explicit translations', () => {
  for (const [en, ru] of Object.entries(russian)) {
    assert(en.length && ru.length); assert.equal(translate('en', en), en); assert.equal(translate('ru', en), ru);
  }
  assert.throws(() => translate('ru', 'Missing translation'));
  const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
  for (const m of app.matchAll(/t\("([^"\\]*(?:\\.[^"\\]*)*)"\)/g)) assert.doesNotThrow(() => translate('ru', JSON.parse('"' + m[1] + '"')));
});
test('Russian search uses singular, plural and zero forms with the original query as data', () => {
  assert.equal(resultCount('ru', 1), '1 глава по запросу');
  assert.equal(resultCount('ru', 2), '2 главы по запросу');
  assert.equal(resultCount('ru', 0), '0 глав по запросу');
  assert.equal(resultCount('ru', 11), '11 глав по запросу');
  assert.equal(resultCount('en', 1), '1 matching chapter');
  assert(emptyResults('ru', '<invalid>').includes('«<invalid>»'));
});
test('SVG export uses selected language, dimensions and real font stack without English prose leaking', () => {
  for (const size of [1, 2]) for (const font of ['mercury', 'system', 'serif']) {
    const p = {...defaults(), size, font}; const ru = specimenSvg(p, 'ru');
    assert(ru.includes('lang="ru"')); assert(ru.includes('следующий шаг')); assert(!ru.includes('Make the next'));
    assert(ru.includes(`viewBox="0 0 720 ${180 + 200 * size}"`)); assert(ru.includes(`font-size="${40 * size}"`));
    assert(ru.includes(font === 'serif' ? 'Georgia,serif' : font === 'system' ? 'system-ui,sans-serif' : 'DM Sans,sans-serif'));
    assert(specimenSvg(p, 'en').includes('Make the next'));
  }
});
