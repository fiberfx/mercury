# Установка mx на Linux — Mercury LMS

> Кандидат нативного архива: Linux x86_64 с glibc 2.39 или новее, mx и стартовое приложение с закреплёнными зависимостями. Rust, Node, npm CLI, BEAM и закрытый репозиторий не нужны.

## Выбор пути

Сохраните работающий mx или инструменты существующего приложения. [Браузерный путь](/ru/start/browser/llms.txt) обходится без CLI. npm-пакет @fiberfx/mx@0.1.0 и архивы ещё ожидают публикации и проверки у потребителя; сверяйте [метаданные](/downloads.json), не считайте URL доказательством доступности.

## Начальная установка через npm после публикации

Планируемый корневой пакет `@fiberfx/mx` — обёртка на Node с необязательными платформенными пакетами. Она находит установленный нативный файл через `require.resolve` и запускает его. Node нужен для каждого вызова mx, установленного через npm. В этом npm-пути нет postinstall и загрузки бинарных файлов из GitHub Releases; npm получает `@fiberfx/mx-linux-x64`. Сохраните необязательные зависимости. Проверки бинарного файла есть только для Linux x64 с glibc 2.39+. Другие платформенные пакеты ещё не собраны и недоступны. Публикация npm и потребительская проверка обёртки ещё не выполнены. Отдельные архивный путь и образ запускают нативный mx без Node. В новом каталоге:

```sh
set -eu
mkdir mercury-native-tools
cd mercury-native-tools
npm install --prefix "$PWD/.mx-tools" --global --ignore-scripts @fiberfx/mx@0.1.0
export PATH="$PWD/.mx-tools/bin:$PATH"
mx --version
```

## Если mx уже работает

После npm или с существующим mx скачайте только стартовое приложение и манифест, когда они опубликованы. Не выполняйте полную установку ниже: она добавит вторую копию mx в PATH. Для нового приложения:

```sh
set -eu
mkdir mercury-native-app
cd mercury-native-app
curl -fLO https://mercury.jonnify.com/downloads/mercury-first-page.tar.gz
curl -fLO https://mercury.jonnify.com/downloads/sha256.sum
sha256sum --check --ignore-missing sha256.sum || exit 1
tar -xzf mercury-first-page.tar.gz
cd mercury-first-page
mx install
mx verify
```

Проверка должна вывести `mercury-first-page.tar.gz: OK`. `--ignore-missing` пропускает запись нативного архива, который не скачивался. Сохраните mx.mod/mx.sum и переходите к разделу «Дальше». Подробности: [установка](/ru/start/install-mx).

## Полная архивная установка

Новый каталог; остановка при любой ошибке. До распаковки обе суммы должны дать OK.

```sh
set -eu
mkdir mercury-scratch
cd mercury-scratch
curl -fLO https://mercury.jonnify.com/downloads/mx-linux-x86_64.tar.gz
curl -fLO https://mercury.jonnify.com/downloads/mercury-first-page.tar.gz
curl -fLO https://mercury.jonnify.com/downloads/sha256.sum
sha256sum --check sha256.sum
tar -xzf mx-linux-x86_64.tar.gz
tar -xzf mercury-first-page.tar.gz
export PATH="$PWD/bin:$PATH"
mx --version
cd mercury-first-page
mx install
mx verify
```

## Дальше

Запустите `mx dev`, откройте выведенный локальный адрес, проверьте оформление Card и Button и два нажатия. После Ctrl-C выполните `mx build`; результат — `dist/`. Полный урок: [Первая страница](/ru/mx/first-app).

## Границы

`mx.sum` закрепляет байты зависимостей; это не аутентифицированная запись базы контрольных сумм. Стартовому приложению не нужен `MXNOSUMDB`. Исключение для новых зависимостей описано на /ru/start/install-mx. macOS и Windows требуют отдельных проверок. [Метаданные выпуска](/downloads.json).

## Навигация

- [Страница в браузере](/ru/start/install-mx)
- [Индекс для агентов](/ru/llms.txt)
- [Все английские текстовые версии](/llms-full.txt)
- [Карта сайта](/sitemap.xml)
- [Текст курса](/ru/start/llms.txt)
