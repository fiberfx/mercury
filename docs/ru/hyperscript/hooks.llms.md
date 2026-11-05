# Хуки — Mercury LMS

> HS1 Mercury Hyperscript. 13 хуков из `@fiberfx/hyperscript/hooks` с сигнатурами из `src/hooks/index.d.ts`. Состояние хука определяется позицией вызова, поэтому вызывайте хуки без условий, в одном порядке, на верхнем уровне компонента.

## Когда читать

При добавлении состояния, ref, эффекта, мемоизированного значения, чтения контекста или внешнего хранилища в функциональный компонент либо при написании собственного хука.

## Контракт

Импортируйте все хуки из `@fiberfx/hyperscript/hooks`, никогда из корневой точки входа.

- `useState<S>(initial: S | (() => S)): [S, (next: S | ((prev: S) => S)) => void]` — начальная функция выполняется один раз; следующее значение, равное по `Object.is`, не вызывает рендеринг.
- `useReducer(reducer, initialState)` / `useReducer(reducer, initialArg, init)`: `[S, Dispatch<A>]`.
- `useRef<T>(initial): { current }` — стабилен в течение жизни компонента; запись не вызывает рендеринг.
- `useImperativeHandle(ref, create, inputs?)` — устанавливает ссылку родителя в результат `create()`.
- `useEffect(effect, inputs?)` — после отрисовки; `effect` может вернуть очистку. Без `inputs` — каждый рендеринг; `[]` — один раз; иначе при неравенстве зависимости по `Object.is` или изменении длины. Предыдущая очистка выполняется перед повторным запуском; при размонтировании выполняются все очистки.
- `useLayoutEffect(effect, inputs?)` — те же аргументы, после изменения DOM и до отрисовки; только для чтения раскладки.
- `useMemo<T>(factory, inputs: Inputs | undefined): T` и `useCallback<T>(callback, inputs): T` — типы требуют `inputs`.
- `useContext<T>(context: Context<T>): T` — значение ближайшего `context.Provider`, иначе значение по умолчанию из `createContext(default)`. Провайдер повторно рендерит читателей, когда `value` становится другим объектом: мемоизируйте его.
- `useSyncExternalStore<T>(subscribe: (onChange) => unsubscribe, getSnapshot: () => T, getServerSnapshot?: () => T): T` — без рассогласования; `getServerSnapshot` используется для рендеринга в строку и гидратации.
- `useId(): string` — стабилен для компонента, используется в парах `aria-*` и `for`.
- `useErrorBoundary(callback?): [error, reset]` — позволяет компоненту перехватывать ошибки потомков.
- `useDebugValue(value, formatter?)` — подпись для отладочных инструментов; без них ничего не делает.

## Минимальный пример

```tsx
import { useEffect, useMemo, useState } from "@fiberfx/hyperscript/hooks";

export function Filtered({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => items.filter((item) => item.includes(query)), [items, query]);
  useEffect(() => {
    document.title = `${shown.length} results`;
  }, [shown.length]);
  return (
    <div>
      <input value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
      <ul>{shown.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
```

## Не выдавать

- Хук внутри условия, цикла, обработчика или после раннего `return`.
- Импорты хуков откуда-либо, кроме `@fiberfx/hyperscript/hooks`: в корневой точке входа их нет.
- Имена, которых пакет не экспортирует: `useTransition`, `useDeferredValue`, `useInsertionEffect`, `useActionState`, `useOptimistic`, `use`.
- `onChange` для обработки каждого введённого символа: используйте `onInput`, см. /ru/hyperscript/dom/llms.txt.

## Далее

- Компоненты и render: /ru/hyperscript/components/llms.txt
- Контракт DOM: /ru/hyperscript/dom/llms.txt
- Эта текстовая версия: /ru/hyperscript/hooks/llms.txt (страница в Markdown, `/hyperscript/hooks.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hyperscript/hooks)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hyperscript/llms.txt)
