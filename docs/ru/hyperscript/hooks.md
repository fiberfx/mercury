Хуки находятся в отдельной точке входа `@fiberfx/hyperscript/hooks`, рядом с `render` и `h` корневой точки входа. Их тринадцать, и все разобраны на этой странице.

```ts
import {
  useState, useReducer, useRef, useImperativeHandle,
  useEffect, useLayoutEffect, useMemo, useCallback,
  useContext, useSyncExternalStore, useId, useErrorBoundary, useDebugValue,
} from "@fiberfx/hyperscript/hooks";
```

## Главное правило

Хуки компонента хранятся в списке; каждый вызов занимает следующий слот. У рендерера нет другого способа различить вызовы `useState`: состояние хука находится по его позиции в порядке вызовов.

Поэтому вызывайте хуки на верхнем уровне компонента или собственного хука, в одном порядке при каждом рендеринге: не внутри условия, цикла или после раннего `return`. Хук в условии сдвигает все последующие хуки в чужие слоты.

## Состояние

`useState(initial)` возвращает текущее значение и функцию установки следующего:

```tsx
import { useState } from "@fiberfx/hyperscript/hooks";

export function Stepper() {
  const [count, setCount] = useState(0);
  return (
    <div class="stepper">
      <button onClick={() => setCount((c) => c - 1)}>−</button>
      <output>{count}</output>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}
```

- **Передавайте функцию для вычисления из предыдущего значения.** `setCount((c) => c + 1)` читает актуальное состояние, даже если до рендеринга в очередь попали несколько обновлений.
- **Передавайте функцию как начальное значение, чтобы вычислить его один раз.** `Form` из Mercury UI использует `useState(createFormRegistry)`: реестр создаётся только при первом рендеринге.
- **Равное значение ничего не меняет.** Если следующее состояние равно текущему по `Object.is`, компонент не рендерится повторно.

`useReducer(reducer, initial)` — тот же хук с логикой обновления в одной функции: `dispatch(action)` вызывает `reducer(state, action)`, чтобы получить следующее состояние. Третий аргумент `init` вычисляет начальное состояние из второго:

```tsx
import { useReducer } from "@fiberfx/hyperscript/hooks";

type Action = { type: "add"; title: string } | { type: "clear" };

function lessons(state: string[], action: Action): string[] {
  switch (action.type) {
    case "add":
      return [...state, action.title];
    case "clear":
      return [];
  }
}

export function Reading() {
  const [list, dispatch] = useReducer(lessons, []);
  return (
    <section>
      <button onClick={() => dispatch({ type: "add", title: `Lesson ${list.length + 1}` })}>Add</button>
      <button onClick={() => dispatch({ type: "clear" })}>Clear</button>
      <ol>{list.map((title) => <li key={title}>{title}</li>)}</ol>
    </section>
  );
}
```

## Ссылки ref

`useRef(initial)` возвращает один объект `{ current }`, сохраняющий идентичность на протяжении жизни компонента. Изменение `current` не вызывает рендеринг — в этом его назначение. Храните в нём DOM-узел, таймер или значение, которое должно переживать рендеринги, не вызывая их.

```tsx
import { useEffect, useRef } from "@fiberfx/hyperscript/hooks";

export function SearchField() {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);
  return <input ref={input} type="search" aria-label="Search" />;
}
```

`useImperativeHandle(ref, create, inputs?)` устанавливает переданную родителем ссылку в объект, возвращённый `create()`. Так компонент предоставляет родителю несколько методов вместо своего DOM-узла.

## Эффекты

`useEffect(effect, inputs?)` запускает код после отображения результата рендеринга на экране: подписки, таймеры, запрос. `effect` может вернуть функцию очистки.

```tsx
import { useEffect, useState } from "@fiberfx/hyperscript/hooks";

export function Elapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <span>{seconds}s</span>;
}
```

`inputs` определяет повторный запуск:

- **Без массива:** после каждого рендеринга.
- **`[]`:** один раз после первого рендеринга.
- **`[a, b]`:** после рендеринга, в котором хотя бы одна зависимость не равна прежней по `Object.is`, либо изменилась длина массива.

Перед повторным запуском эффекта выполняется его предыдущая очистка; при размонтировании компонента выполняются его очистки. Эффекты запускаются после отрисовки браузером, а очистки размонтированных компонентов — до любых новых эффектов.

`useLayoutEffect(effect, inputs?)` принимает те же аргументы, но выполняется после изменения DOM и до отрисовки браузером. Используйте его только для измерения раскладки и установки состояния по результатам до того, как пользователь увидит кадр. Остальная работа относится к `useEffect`, который не блокирует отрисовку.

## Мемоизация

`useMemo(factory, inputs)` возвращает результат `factory()` и сохраняет его, пока не изменится зависимость. `useCallback(callback, inputs)` сохраняет ту же функцию до изменения зависимости; это `useMemo(() => callback, inputs)`. Типы требуют массив `inputs`: без него вычисление повторяется при каждом рендеринге, что почти всегда является ошибкой.

Мемоизация нужна, чтобы сохранить идентичность значения для сравнения: в зависимостях эффекта, значении контекста или свойствах компонента `memo`.

## Контекст

`useContext(context)` читает значение ближайшего `context.Provider` выше компонента либо значение контекста по умолчанию, если провайдера нет. При изменении значения провайдера компонент рендерится снова. `EnvironmentProvider` из Mercury UI читает родительское значение и предоставляет объединённое:

```tsx
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { useContext, useMemo } from "@fiberfx/hyperscript/hooks";
import { UiEnvironmentContext, mergeUiEnvironment } from "@fiberfx/core";
import type { UiEnvironmentOptions } from "@fiberfx/core";

export interface EnvironmentProviderProps extends UiEnvironmentOptions {
  children?: ComponentChildren;
}

export function EnvironmentProvider({
  children,
  portalContainer,
  ownerDocument,
  ownerWindow,
  direction,
  locale,
  reducedMotion,
  focusFallback,
  idPrefix,
}: EnvironmentProviderProps) {
  const parent = useContext(UiEnvironmentContext);
  const value = useMemo(
    () => mergeUiEnvironment(parent, { portalContainer, ownerDocument, ownerWindow, direction, locale, reducedMotion, focusFallback, idPrefix }),
    [parent, portalContainer, ownerDocument, ownerWindow, direction, locale, reducedMotion, focusFallback, idPrefix],
  );
  return <UiEnvironmentContext.Provider value={value}>{children}</UiEnvironmentContext.Provider>;
}
```

Сам контекст создаётся один раз в `@fiberfx/core` через `createContext<UiEnvironmentOptions | null>(null)` из корневой точки входа. `useMemo` здесь существенен: если провайдер при каждом рендеринге создаёт новый объект значения, все читающие его компоненты рендерятся снова.

## Внешние хранилища

`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` читает значение вне дерева компонентов. `subscribe(onChange)` регистрирует слушателя и возвращает функцию его удаления; `getSnapshot()` возвращает текущее значение. Чтение не допускает рассогласования: изменение между рендерингом и фиксацией вызывает повторный рендеринг. `getServerSnapshot` читается при рендеринге в строку и во время гидратации.

```tsx
import { useSyncExternalStore } from "@fiberfx/hyperscript/hooks";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function NetworkStatus() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  return <span class="network">{online ? "Online" : "Offline"}</span>;
}
```

`ListBox`, `Combobox` и `CustomSelect` из Mercury UI так читают реестры вариантов: `useSyncExternalStore(registry.subscribe, registry.getVersion, registry.getVersion)`.

## Идентификаторы, ошибки и отладочные значения

- **`useId()`** возвращает строку, стабильную в течение жизни компонента, для связывания элементов по id: `aria-labelledby`, `aria-controls`, `for` метки. `Collapsible` из Mercury UI использует `` const contentId = `${useId()}-content` ``.
- **`useErrorBoundary(callback?)`** превращает компонент в границу обработки ошибок. Возвращает `[error, reset]`: `error` — ошибка, выброшенная потомком, или `undefined`; `reset()` очищает её, чтобы снова отобразить потомков. `callback(error, errorInfo)` вызывается для каждой перехваченной ошибки.
- **`useDebugValue(value, formatter?)`** задаёт подпись собственного хука для средств отладки: передаёт `value` или `formatter(value)` в отладочный слот рендерера и ничего не делает, если инструмент не подключён.

```tsx
import type { ComponentChildren } from "@fiberfx/hyperscript";
import { useErrorBoundary } from "@fiberfx/hyperscript/hooks";

export function Boundary({ children }: { children: ComponentChildren }) {
  const [error, reset] = useErrorBoundary();
  if (error) {
    return (
      <div role="alert">
        <p>This part of the page failed to render.</p>
        <button onClick={reset}>Try again</button>
      </div>
    );
  }
  return <>{children}</>;
}
```
