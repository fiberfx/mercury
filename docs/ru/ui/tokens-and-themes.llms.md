# UI0: токены и темы — Mercury LMS

> Единая таблица токенов Mercury UI, `fiberfx/ui/src/styles/tokens.css`, также доступная как `@fiberfx/ui/tokens.css`, содержит все значения цветов, типографики, радиусов, отступов и теней. Тема — класс `.light-theme` или `.dark-theme` на `<html>`; по умолчанию `:root` задаёт светлую.

## Когда читать

При оформлении собственной раскладки приложения Mercury, выборе цвета состояния или переключении темы.

## Контракт (уровень готовности: опубликован, Shipped — @fiberfx/ui 4.0.0 в npm с 2026-11-05)

- Цветовые токены — тройки RGB: всегда `rgb(var(--token))`. Полупрозрачные слои уже содержат альфа-канал (`--bg-hover: 28 32 36 / 0.06`), но тоже используют `rgb(var(--bg-hover))`.
- Остальные токены — полные значения: `var(--space-16)`, `var(--radius-8)`, `var(--shadow-200)`, `var(--font-primary)`, `var(--text-body-300-size)`.
- Читайте семантические токены, а не шкалы: `--bg-*`, `--fg-*`, `--border-*`, `--ring-focus`, `--ring-negative`. Имена: `<role>-<intent>-<variant>-<state>`.
- Поверхности: `--bg-primary` — страница, `--bg-secondary` — приподнятая, `--bg-tertiary` — углублённая, `--bg-elevated` — popover/модальное окно. Текст: `--fg-primary`, `--fg-secondary`, `--fg-tertiary`. Тонкая граница: `--border-primary`. Текст на сплошном фоне: `--fg-on-<intent>`.
- Шкалы: `--slate-1..12`, `--iris-1..12` — фирменная, `--indigo-1..12` — активное состояние, информация, ссылка; `--green-`, `--red-`, `--orange-`, `--plum-` со ступенями 3, 9, 11.
- Отступы `--space-2..128`; радиусы `--radius-2..32`, `--radius-full`; типографика `--text-body-100..500`, `--text-heading-100..500` (`-size`, `-lh`); насыщенность `--fw-regular|medium|semi-bold|bold|black`; тени `--shadow-100..600`.
- Кольцо фокуса: `box-shadow: 0 0 0 3px rgb(var(--ring-focus))`.
- Тема: переключайте `dark-theme` / `light-theme` на `document.documentElement` до первой отрисовки. Вложенная обёртка `.dark-theme` тоже работает: заново объявляет семантические токены.

## Минимальный пример

```css
.panel {
  background: rgb(var(--bg-secondary));
  border: 1px solid rgb(var(--border-primary));
  border-radius: var(--radius-8);
  padding: var(--space-16);
}
```

```ts
document.documentElement.classList.toggle("dark-theme", dark);
document.documentElement.classList.toggle("light-theme", !dark);
```

## Не выдавать

Буквальный цвет, размер, отступ или радиус при наличии токена; `var(--bg-brand)` без `rgb()`; `rgb(var(--shadow-200))`; `<html data-theme>` вместо классов темы Mercury UI (у оболочки документации отдельный контракт data-theme); написанный вручную класс `.mx-*`.

## Ограничения

В светлой теме текст `--fg-on-brand` на `--green-9`, `--orange-9`, `--red-9` и символ на `--orange-9` не проходят WCAG AA: список LIGHT_DEFECTS в `fiberfx/ui/scripts/check-contrast.mjs`. Оболочка документации уже использует HttpOnly cookie `theme`, форму POST/303 и серверный `data-theme`; без cookie CSS следует системной теме. Переключатель обходится без скрипта. Приложения с Mercury UI используют описанные выше классы темы.

## Далее

- Курс: /ru/ui/llms.txt
- UI1, основы: /ru/ui/foundations/llms.txt
- Эта текстовая версия: /ru/ui/tokens-and-themes/llms.txt (страница в Markdown, `/ui/tokens-and-themes.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/ui/tokens-and-themes)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/ui/llms.txt)
