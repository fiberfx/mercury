# Первая страница Mercury — Mercury LMS

> MX0: оформленный счётчик Card + Button на Hyperscript, собранный нативным mx. Нативный путь для Linux; приложению не нужны React, Rust, BEAM и закрытый репозиторий. Архивный путь и образ обходятся без Node; планируемой npm-обёртке Node нужен при каждом запуске mx.

## Начало

Выполните [установку mx](/ru/start/install-mx/llms.txt): сохраните работающий mx или выберите доступный способ установки, скачайте стартовое приложение и проверьте сумму до распаковки, затем `mx install` и `mx verify`. Сохраните готовые `package.json`, `mx.mod` и `mx.sum`: три пакета Hyperscript/core/ui закреплены на 4.0.0.

## app/main.tsx

```tsx
import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";
import { Card, Button } from "@fiberfx/ui";
import "@fiberfx/ui/styles.css";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Card title="My first Mercury page">
      <p aria-live="polite">Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </Card>
  );
}

render(<Counter />, document.getElementById("app")!);
```

## Проверка

HTML должен содержать `#app`, `<!-- mercury:importmap -->` и `<script type="module" src="./app/main.tsx"></script>`. Полный HTML: [Первая страница](/ru/mx/first-app).

`mx dev` выводит локальный URL. Проверьте оформление, изменение Count: 0 → 1 → 2 и правку заголовка после сохранения. Ctrl-C; `mx build` создаёт `dist/index.html` и ресурсы. Откройте dist через HTTP-сервер и повторите проверку. При отсутствии браузера сообщите, что взаимодействие не проверено.

Не копируйте тестовый fixture, не добавляйте локальные replace, React или Vite. Импорт CSS обязателен для оформления. Ошибка контрольной суммы останавливает установку. Phoenix/LiveView необязательны. [SKILL.md](/SKILL.md) — инструкция агенту.

## Навигация

- [Страница в браузере](/ru/mx/first-app)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/mx/llms.txt)
