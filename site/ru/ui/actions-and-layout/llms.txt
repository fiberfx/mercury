# UI2: действия и раскладка — Mercury LMS

> Действия Mercury UI — `Button`, `IconButton`, `Link` — и уровень композиции раскладки: `Box`, `Stack`, `Flex`, `Grid`, `Container`, `Spacer`, `GridItem`, `Center`, `Sidebar`, `Cluster`, `Section`. Свойства отступов и радиусов называют ступени шкал токенов.

## Когда читать

При размещении кнопки, элемента с одной иконкой или встроенной ссылки, а также при построении экрана без отдельного CSS для отступов.

## Контракт (уровень готовности: опубликован, Shipped — @fiberfx/ui 4.0.0 в npm с 2026-11-05)

- `Button`: `variant` primary по умолчанию | secondary | outline | ghost | destructive | inverse; `size` sm | md по умолчанию | lg; `loading` отключает кнопку, задаёт `aria-busy`, заменяет ведущую иконку индикатором; `fullWidth`; `leading`; `trailing`; `type` по умолчанию `"button"`.
- `IconButton`: `icon` и `label` обязательны; `label` → `aria-label` и `title`; `variant` primary | secondary по умолчанию | outline | ghost | destructive; `size` sm | md | lg; `shape` circle по умолчанию | square.
- Символы `Icon` (38): arrow, arrow-up-right, arrow-down-left, check, close, plus, minus, search, star, bell, cog, user, users, home, list, mail, wallet, credit-card, shield, globe, help-circle, chevron-right, chevron-down, alert, info, download, upload, trash, refresh, copy, pause, play, repeat, trending-up, bank, bolt, flow, batch. `IconName` принимает любую строку; неизвестное имя ничего не рисует.
- `Link`: `<a>`, если задан `href` и нет `disabled`, иначе `<button>`; `size` sm | md; `muted`; `leading`; `trailing`; `onClick`; `target`; `rel`.
- Шкалы — экспортируемые типы: `SpaceScale` "2".."128" → `var(--space-*)`; `RadiusScale` "2".."32" | "full"; `Align` start | center | end | stretch | baseline; `Justify` start | center | end | between | around | evenly.
- `Box`: `p`/`px`/`py`/`pt`/`pr`/`pb`/`pl`, `bg` primary | secondary | tertiary | brand | brand-subtle | elevated, `radius`, `border`, `shadow` "100".."600".
- `Stack`: `gap`, `align`, `justify`. `Flex`: `direction`, `gap`, `align`, `justify`, `wrap`. `Grid`: `cols`, `rows` (число — равные треки, строка — шаблон), `gap`, `flow`, `align`, `justify`.
- Каждый компонент этого уровня принимает `as` и передаёт остальные атрибуты.

## Минимальный пример

```tsx
import { Box, Button, Flex, IconButton } from "@fiberfx/ui";

export const Bar = () => (
  <Box p="16" bg="secondary" radius="8" border>
    <Flex gap="8" align="center" justify="between">
      <IconButton icon="trash" label="Discard" variant="ghost" />
      <Button variant="primary">Save</Button>
    </Flex>
  </Box>
);
```

## Не выдавать

Свойства шкал как числа или пиксели (`gap={12}`, `gap="12px"`: используйте `gap="12"`); `IconButton` без `label`; имя иконки вне набора; `<Link disabled href>` с ожиданием ссылки; отступы в `style`, когда есть свойство шкалы; импорты `react` или `effector`.

## Далее

- Курс: /ru/ui/llms.txt
- UI1, основы: /ru/ui/foundations/llms.txt
- Эта текстовая версия: /ru/ui/actions-and-layout/llms.txt (страница в Markdown, `/ui/actions-and-layout.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/ui/actions-and-layout)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/ui/llms.txt)
