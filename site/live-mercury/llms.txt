# Live Mercury, islands on the BEAM — Mercury LMS

> Mercury hyperscript components ("islands") inside Phoenix and LiveView. Server: `LiveMercury.mercury/1` (echo/apps/live_mercury). Browser: `@fiberfx/live-mercury` 4.0.0, peer `@fiberfx/hyperscript`. EDU's islands are built by `mx build --lib` with no Node.

## Read this when

You put a Mercury component on a page Phoenix renders, wire it to a LiveView, or build its bundle. This is the course's landing; LM0–LM5 follow, and LM6 is planned.

## The contract

- An island is one element with `phx-update="ignore"` and a `phx-hook`; a client hook mounts a hyperscript component into it.
- Server, LiveView host: `<LiveMercury.mercury name="X" ...props />` renders `phx-hook="MercuryHook"`, `data-name="X"`, `data-props`, `data-props-diff`, `data-streams-diff`, `data-slots`, `data-ssr`, `data-use-diff`.
- Browser: `getHooks({ X })` returns `{ MercuryHook }` for `new LiveSocket(path, Socket, { hooks })`. The server's `name` must equal the map's key.
- EDU host: `<.island id bundle props>` (`EchoEduWeb.Island`) renders `phx-hook="CourseIsland"`, `data-bundle`, and a `<script type="application/json">` props child. The bundle exports `default` and `hook = courseIsland(Component)` from `@echd/edu-boot/island`.
- `@fiberfx/live-mercury` exports: `getHooks`, `createMercuryHook`, `useLiveMercury`, `LiveMercuryProvider`, `LiveMercuryContext`, `Link`, `decodeCompactJson`, `decodeCompactPatch`, `applyPatch`, `applyOperation`, `getValueByPointer`.

## Minimal example

```ts
import { Socket } from "@fiberfx/phoenix";
import { LiveSocket } from "@fiberfx/phoenix_live_view";
import { getHooks } from "@fiberfx/live-mercury";
import { KanBoard } from "./board";

const liveSocket = new LiveSocket("/live", Socket, { hooks: getHooks({ KanBoard }) as never });
liveSocket.connect();
```

## Never emit

An import from `react` or `react-dom`. Islands render with `@fiberfx/hyperscript`.

## Limits

- EDU's islands are built by mx in the image (no `node` in that stage). The KAN views' `kan.mjs` is committed and built outside the image.

## Next

- LM0: /live-mercury/islands (/live-mercury/islands/llms.txt)
- LM1: /live-mercury/liveview (/live-mercury/liveview/llms.txt)
- LM2: /live-mercury/building (/live-mercury/building/llms.txt)
- LM3: /live-mercury/props-and-streams (/live-mercury/props-and-streams/llms.txt)
- LM4: /live-mercury/server-rendering (/live-mercury/server-rendering/llms.txt)
- LM5: /live-mercury/testing (/live-mercury/testing/llms.txt)
- LM6, the capstone (an island in a LiveView built with no Node): planned; waits on epic 24's H3–H5 and on `kan.mjs` leaving Vite
- The site: /llms.txt
- This companion: /live-mercury/llms.txt

## Navigation

- [Read this page in the browser](/live-mercury)
- [Agent index](/llms.txt)
- [All English companions](/llms-full.txt)
- [Sitemap](/sitemap.xml)

### Chapter companions

- [/live-mercury/building](/live-mercury/building/llms.txt)
- [/live-mercury/islands](/live-mercury/islands/llms.txt)
- [/live-mercury/liveview](/live-mercury/liveview/llms.txt)
- [/live-mercury/props-and-streams](/live-mercury/props-and-streams/llms.txt)
- [/live-mercury/server-rendering](/live-mercury/server-rendering/llms.txt)
- [/live-mercury/testing](/live-mercury/testing/llms.txt)
