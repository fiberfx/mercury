# UI1: окружение поддерева — Mercury LMS

> Окружение Mercury UI — единый наследуемый контекст из `@fiberfx/core`, в котором компоненты читают узел порталов, документ и окно, направление, локаль, ограничение движения, резервный фокус и префикс id. `EnvironmentProvider`, `DirectionProvider` и `LocaleProvider` задают его, не создавая DOM; `Portal` читает целевой узел.

## Когда читать

При рендеринге Mercury внутри iframe, встроенного редактора или острова на чужой странице; для раздела с письмом справа налево; при локализации подписей, чисел, дат и форм множественного числа.

## Контракт (уровень готовности: опубликован, Shipped — @fiberfx/ui 4.0.0 в npm с 2026-11-05)

- Свойства `EnvironmentProvider`: `portalContainer`, `ownerDocument`, `ownerWindow` (допускают null), `direction` (`"ltr" | "rtl"`), `locale` (BCP 47), `reducedMotion` (`"user" | "always" | "never"`, по умолчанию `"user"`), `focusFallback`, `idPrefix`, `children`.
- Объединение: пропущенное свойство наследуется; `null` означает недоступность и не заменяется значением по умолчанию. Без провайдера: глобальный `document`, его `body`, `ltr`.
- Уничтоженный узел или `null`: наложения ничего не отображают, фокус переходит в `focusFallback`. На сервере все ресурсы — `null`, порталы ничего не отображают.
- Несколько островов на странице: задайте каждому корню отдельный `idPrefix`.
- `Portal({ children, container? })`: приоритет у `container`, иначе `portalContainer` окружения; без узла возвращается `null`. Контекст следует дереву компонентов, события DOM всплывают через целевой узел.
- `DirectionProvider({ dir })`, `dir` обязателен; `useDirection()` → `"ltr" | "rtl"`.
- `LocaleProvider({ locale, direction?, catalogs?, fallbackLocales? })`: `locale` обязателен; `direction: "auto"` определяется по системе письма; пропущенные `catalogs` и `fallbackLocales` наследуются.
- `useLocale()` → `{ locale, direction, explicit }`.
- `useLocaleFormatters({ timeZone, numberOptions, dateOptions, listOptions, collationOptions })` → `formatNumber`, `formatDate`, `formatList`, `plural`, `pluralCategory`, `compare`, `contains`, `startsWith`, `endsWith`.
- `useMessageFormatter()` → `format(key, values)`, `resolve(key, values)` с `source`: `catalog | fallback | bundled | missing`, `missing()`. Цепочка: локаль, её родители, каждая резервная локаль и её родители, затем встроенный английский текст Mercury для `mercury.close`, `mercury.clear`, `mercury.loading`, `mercury.moreActions`, `mercury.selectedCount`. Неизвестный ключ отображается самим ключом.
- Также экспортируются `createLocaleFormatters`, `createMessageFormatter`, `localeDirection`, тип `MessageCatalogs`.

## Минимальный пример

```tsx
import { LocaleProvider, useLocaleFormatters, useMessageFormatter } from "@fiberfx/ui";
import type { MessageCatalogs } from "@fiberfx/ui";

const catalogs: MessageCatalogs<"cart.items"> = {
  en: { "cart.items": (v, f) => f.plural(Number(v.count), { one: "# item", other: "# items" }) },
};

function CartLine({ count, total }: { count: number; total: number }) {
  const f = useLocaleFormatters({ numberOptions: { style: "currency", currency: "EUR" } });
  const t = useMessageFormatter();
  return <p>{t.format("cart.items", { count })}, {f.formatNumber(total)}</p>;
}

export const Cart = () => (
  <LocaleProvider locale="en-GB" catalogs={catalogs}>
    <CartLine count={3} total={42.5} />
  </LocaleProvider>
);
```

## Не выдавать

Второе хранилище локали или контекст направления; ожидание, что провайдер задаст `lang` либо `dir` — приложение задаёт оба на своём корне; ручной `UiEnvironmentContext.Provider` — используйте объединяющий `EnvironmentProvider`; `ReactNode`, `createPortal` из `react-dom`, любые импорты `react` или `effector`.

## Далее

- Курс: /ru/ui/llms.txt
- UI0, токены и темы: /ru/ui/tokens-and-themes/llms.txt
- Эта текстовая версия: /ru/ui/foundations/llms.txt (страница в Markdown, `/ui/foundations.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/ui/foundations)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/ui/llms.txt)
