# Контекст, порталы и memo — Mercury LMS

> HS3 Mercury Hyperscript (`@fiberfx/hyperscript` 4.0.0). `createContext`, `createPortal`, `memo`, `cloneElement`, `toChildArray` и `isValidElement` экспортируются из корневой точки входа; `useContext` — из `./hooks`.

## Когда читать

При передаче значения вниз по дереву, отображении наложения вне DOM предков, пропуске рендерингов через `memo`, чтении или преобразовании `children` компонента.

## Контракт

- `createContext<T>(defaultValue: T): Context<T>`. `Context.Provider`, сам объект контекста, принимает `{ value, children }`. `Context.Consumer` принимает `{ children: (value: T) => ComponentChildren }`. Без провайдера выше читатели получают `defaultValue`.
- Провайдер повторно рендерит каждого читателя, если `value` отличается от прежнего по `!=`, даже через `shouldComponentUpdate` с false и `memo`. Мемоизируйте объектные значения через `useMemo`.
- Классы: `static contextType = Ctx`, чтение через `this.context`.
- `createPortal(children, container: ContainerNode): VNode`. Контекст следует дереву компонентов; нативные события всплывают по DOM контейнера. В Mercury UI `<Portal container?>` из `@fiberfx/ui` берёт целевой узел из `EnvironmentProvider` и ничего не отображает без него.
- `memo(component, comparer?)`: пропускает рендеринг при поверхностно равных свойствах (`!==` по ключам). `comparer(prev, next)` возвращает `true`, если они РАВНЫ. Изменённый `ref` всегда вызывает рендеринг. `displayName` имеет вид `Memo(Name)`.
- `cloneElement(vnode, props?, ...children): VNode`: свойства накладываются на свойства элемента; `key`/`ref` заменяют собственные значения; переданное содержимое заменяет дочернее.
- `toChildArray(children): Array<VNode | string | number>`: разворачивает вложенность, удаляет `null`, `undefined` и логические значения. `isValidElement(x): x is VNode`.

## Минимальный пример

```tsx
import { createContext, createPortal, memo } from "@fiberfx/hyperscript";
import { useContext } from "@fiberfx/hyperscript/hooks";

const Tone = createContext<"neutral" | "danger">("neutral");

const Toast = memo(function Toast({ text }: { text: string }) {
  const tone = useContext(Tone);
  return createPortal(<div role="status" class={`toast toast--${tone}`}>{text}</div>, document.body);
});

export function Page() {
  return <Tone.Provider value="danger"><Toast text="Saved" /></Tone.Provider>;
}
```

## Не выдавать

- `memo` со сравнением, где `true` означает «изменилось»: `true` означает равенство.
- Объектный литерал `value={{ … }}` провайдера для часто читаемого значения: оберните его в `useMemo`.
- Объект вспомогательных методов `Children` (`Children.map`, `Children.toArray`): он не экспортируется; используйте `toChildArray`.
- `forwardRef`: функциональный компонент получает `ref` как свойство.

## Далее

- Хуки: /ru/hyperscript/hooks/llms.txt
- Рендеринг на сервере: /ru/hyperscript/server/llms.txt
- Эта текстовая версия: /ru/hyperscript/context/llms.txt (страница в Markdown, `/hyperscript/context.md`, запланирована на W3)

## Навигация

- [Страница в браузере](/ru/hyperscript/context)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/hyperscript/llms.txt)
