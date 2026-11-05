# Сборка островов с mx: без Node — Mercury LMS

> LM2. `mx build --lib` собирает одну точку входа в один ES-модуль (Rolldown, Hypercompiler, без sid). Пять статических ресурсов островов EDU — пять таких сборок; образ echd-os выполняет их на этапе без `node` в PATH.

## Когда читать

Когда собираете бандл острова, добавляете остров в EDU или меняете сборку островов в образе.

## Контракт

- `mx build --lib <entry> --out <file> [--root <dir>] [--external <package>]... [--define <name>=<expression>]... [--minify] [--require-export <name>]...`. `--lib` и `--out` обязательны; `--root` по умолчанию равен `.`; любой другой флаг отклоняется; `--lib` нельзя сочетать с `--bundle` или `--host`.
- Импорты разрешаются из исходников модулей, как при `mx dev`. Пакет, отмеченный `--external`, и его подпути остаются импортами по имени для карты импортов страницы. Импорт CSS становится пустым модулем и не создаёт выходного файла.
- Один выходной файл: более одного чанка — ошибка. Экспорт, указанный в `--require-export`, отсутствует → код завершения 1, `"<entry> does not export <names> (it exports …)"`, ничего не записано.
- `mx.mod` острова перечисляет все модули, достижимые в графе импортов (`require`), и каталог каждого из них (`replace`).
- Сборки EDU (`node/apps/edu-boot/bin/build-assets.sh <dest>`, `MX` — исполняемый файл mx): `phoenix.js`; `phoenix_live_view.js` (`--external @fiberfx/phoenix`, `--define LV_VSN=…`); `edu-boot.js` (пара phoenix и `phoenix` остаются внешними); `edu-island-demo.js` (`--require-export default --require-export hook`); `edu-island-kan.js` (дополнительно `--require-export KanFigure`). Все используют `--minify`. У островов внешних импортов нет.
- `scripts/edu/build-islands.sh` записывает их в `echo/apps/echo_edu/priv/static/edu` (каталог исключён из Git), добавляет `mercury.css` и шрифты и завершается ошибкой, если хотя бы один из шести файлов отсутствует или пуст. Они доступны по пути `/_edu/assets`.
- Образ (`echo/Dockerfile`, этап `edu-islands`, `rust:1.97.0-bookworm`): `cargo build --release --locked --bin mx`, затем `! command -v node && MX=… bash scripts/edu/build-islands.sh`; этап Elixir копирует `priv/static/edu` перед `mix release echd_os`.

## Минимальный пример

```sh
mx build --lib node/apps/edu-island-demo/src/index.tsx --root node/apps/edu-island-demo \
  --out priv/static/edu/edu-island-demo.js --minify --require-export default --require-export hook
```

## Ограничения

- `kan.mjs` приложения echd_os (острова представлений KAN) хранится в Git и собирается скриптом `node/apps/echd-os/bin/kan-build.sh` с pnpm, tsc, Vitest и Vite; образ не собирает для него JavaScript.
- Разработка: `EDU_ISLAND_DEV` (`name=url,…`) может направить `bundle_url(name)` на точку входа `.ts`/`.tsx` сервера Vite; загрузчик сначала устанавливает клиент HMR Vite.
- Образ выполнения — `node:<version>-bookworm-slim`; его `node` предназначен для будущего воркера, а не для сборки.

## Далее

- LM3, свойства и потоки: /ru/live-mercury/props-and-streams (/ru/live-mercury/props-and-streams/llms.txt)
- К курсу: /ru/live-mercury/llms.txt
- Этот справочник: /ru/live-mercury/building/llms.txt

## Навигация

- [Страница в браузере](/ru/live-mercury/building)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/live-mercury/llms.txt)
