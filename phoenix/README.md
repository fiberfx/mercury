<!-- Published by scripts/package_readmes.py from fiberfx/phoenix/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/phoenix

The [Phoenix](https://www.phoenixframework.org/) JavaScript client (`Socket`, `Channel`,
`Presence`, `LongPoll`, `Serializer`), ported to TypeScript for Mercury Islands.

## Install

```bash
npm i @fiberfx/phoenix
```

## Use

```ts
import { Socket } from "@fiberfx/phoenix";

const socket = new Socket("/socket", { params: { token } });
socket.connect();
const channel = socket.channel("room:lobby", {});
channel.join();
```

The package ships standard ES2024 modules (`dist/index.js`) with TypeScript
declarations (`dist/*.d.ts`). It needs no bundler: Node imports it directly, and a
browser loads it through an import map that maps `@fiberfx/phoenix` to the file.

## License

MIT. Derived from the Phoenix JavaScript client, Copyright (c) 2014 Chris McCord; see
[LICENSE](LICENSE).
