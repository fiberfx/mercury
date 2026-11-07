<!-- Published by scripts/package_readmes.py from fiberfx/analytics/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/analytics

The browser client for Mercury Analytics. It renders the dashboard's islands on Mercury UI (`Card`, `Stat`, `Chart`) and Mercury hyperscript, gives each mount its own forked Effector scope, and mounts them through Live Mercury's `MercuryHook`. It uses no React and no Tailwind. The server half is `echo/apps/mercury_analytics`, whose LiveView components render `<.island name="...">`.

```ts
import { analyticsHooks } from "@fiberfx/analytics";

new LiveSocket("/live", Socket, { hooks: { ...analyticsHooks() } });
```

`analyticsHooks()` returns `MercuryHook`. It also returns the same hook as `ReactHook`, because live_mercury's server helper still names it that until mercury.80 I1. The dashboard page loads `dist-islands/islands.js` (`pnpm build:islands`), one classic script that sets `window.MercuryAnalyticsHooks`, and the mercury_analytics layout inlines it.

| Island | State |
| --- | --- |
| `SingleStat` | Ported: `Stat` in a raised `Card`, with the figure and range from `statData` and `dateRange` |
| `VisitsChart` | Ported: visits and unique visitors per period on `Chart`. A bad count renders as an alert, never as a wrong curve |
| `RequestsChart`, `StatusChart`, `DeviceChart`, `PopularChart`, `ResChart`, `DateRangePicker`, `ColorSelector`, `ThemeToggle` | Named placeholders: they render a `Card`, not the chart yet |

The state lives in `model.ts`. The units are defined once: `propsReceived` carries every LiveView update into the mount's scope, and `$rows`, `$figure`, `$range` and `$updates` derive what the islands show. `scoped(Component)` forks one scope per mount and delivers each new props object to it before the render.

Tests: `CI=1 pnpm exec vitest run --project jsdom-hyperscript analytics`. The geometry's must-fail row refuses a count that isn't a finite, non-negative number.

The islands are ported from phoenix_analytics 0.4.2's React components (Apache-2.0, @lalabuy948); see LICENSE.
