# Mercury UI — дизайн-система — Mercury LMS

> `@fiberfx/ui` 4.0.0: дизайн-система Mercury. 139 компонентов в десяти семействах на `@fiberfx/hyperscript`, оформление через свойства с перечислениями и единую таблицу токенов. Рядом с исходником каждого компонента находится контракт `<Name>.prompt.md`, написанный вручную. Без React.

## Когда читать

При создании экрана приложения Mercury, когда нужно узнать доступные компоненты, их источник и правила оформления. Это вводная страница курса; далее идут главы.

## Контракт (уровень готовности: опубликован, Shipped — @fiberfx/ui 4.0.0 в npm с 2026-11-05)

- Компоненты: `import { Button, Card } from "@fiberfx/ui"`. Для опубликованной версии 4.0.0 подключите CSS явно: `import "@fiberfx/ui/styles.css"` в нативном приложении либо link на закреплённую таблицу стилей в [браузерном HTML](/ru/start/browser/llms.txt). Импорт компонентов сам по себе не гарантирует оформление.
- Только CSS: `@fiberfx/ui/styles.css` целиком или `@fiberfx/ui/tokens.css` только с токенами.
- Peer-зависимости: `@fiberfx/hyperscript` 4.0.0 и `@fiberfx/core` 4.0.0. JSX компилируется для `@fiberfx/hyperscript`.
- Семейства: actions (3), foundations (19), inputs (32), forms (8), selection (15), feedback (8), data-display (17), navigation (11), overlay (11), layout (15).
- Оформляйте компонент через свойства с перечислениями (`variant`, `size`, `tone`), собственную раскладку — через `rgb(var(--token))`.
- Классы `.mx-*` (`mx-btn`, `mx-card`, ...) внутренние: не пишите их. Компонент добавляет ваши классы из свойства `class`.
- Также реэкспортируются из `@fiberfx/core`: `cx`, `createFormatter`, `createTimeFormatter`, `useFocusManager`, `useLocale`, `useLocaleFormatters`, `useMessageFormatter`, `createLocaleFormatters`, `createMessageFormatter`, `localeDirection`.

## Минимальный пример

```tsx
import { Button, Card } from "@fiberfx/ui";

export function SaveCard() {
  return (
    <Card variant="raised" title="Draft">
      <Button variant="primary">Save</Button>
    </Card>
  );
}
```

`Button`: `variant` primary | secondary | outline | ghost | destructive | inverse; `size` sm | md | lg; `loading`, `fullWidth`, `leading`, `trailing`, `type`. `Card`: `variant` flat | raised | floating; `padding`, `title`, `actions`.

## Не выдавать

Написанный вручную класс `.mx-*`, буквальный цвет при наличии токена, `npm i`, импорты из `react`, `react-dom` или `effector`.

## Далее

- UI0, токены и темы: /ru/ui/tokens-and-themes/llms.txt
- UI1, основы: /ru/ui/foundations/llms.txt
- UI2, действия и раскладка: /ru/ui/actions-and-layout/llms.txt
- UI3, ввод и формы: /ru/ui/inputs-and-forms
- UI4, выбор: /ru/ui/selection
- UI5, обратная связь и отображение данных: /ru/ui/feedback-and-data
- UI6, навигация: /ru/ui/navigation
- UI7, наложения и итоговое задание: запланирована, страницы пока нет
- Эта текстовая версия: /ru/ui/llms.txt (страница в Markdown, `/ui.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/ui)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)

### Текстовые версии глав

- [/ru/ui/actions-and-layout](/ru/ui/actions-and-layout/llms.txt)
- [/ru/ui/feedback-and-data](/ru/ui/feedback-and-data/llms.txt)
- [/ru/ui/foundations](/ru/ui/foundations/llms.txt)
- [/ru/ui/inputs-and-forms](/ru/ui/inputs-and-forms/llms.txt)
- [/ru/ui/navigation](/ru/ui/navigation/llms.txt)
- [/ru/ui/selection](/ru/ui/selection/llms.txt)
- [/ru/ui/tokens-and-themes](/ru/ui/tokens-and-themes/llms.txt)
