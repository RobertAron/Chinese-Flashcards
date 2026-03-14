# Bug Report: `useId()` Hydration Mismatch in Next.js + Bun Dev with Turbopack

## Summary

When using Next.js 16 with Bun's dev server and Turbopack, `useId()` produces different
values on the server vs the client, causing a hydration mismatch error. The same app
works correctly with Node's dev server under identical conditions. The error only
manifests when RSC children are passed through a client component (e.g. `<ClientProvider>{children}</ClientProvider>`
in the layout).

## Environment

- **Next.js**: 16.1.6
- **React**: 19 (included in Next.js 16)
- **Bun**: 1.2.x (Turbopack dev server) → **FAILS**
- **Node**: 22.x (Turbopack dev server via `next dev`) → **PASSES**
- **Browsers**: Chrome 134, Firefox 135 (not browser-specific)

## Reproduction

Layout pattern that triggers the bug:

```tsx
// app/layout.tsx (Root Server Component)
export default function RootLayout({ children }) {
  return (
    <ClientProvider>   {/* "use client" component that wraps RSC children */}
      <html>
        <body>{children}</body>  {/* RSC children passed through client component */}
      </html>
    </ClientProvider>
  );
}
```

```tsx
// utils/playerState.ts
"use client";
import { createZustandContext } from "./createZustandContext";
const { Provider: PlayerProvider } = createZustandContext<PlayerState>({ ... });
export { PlayerProvider };
// PlayerProvider renders: <Context.Provider value={...}>{children}</Context.Provider>
```

When you remove `{children}` from the client component (or don't pass children through it),
the error does **not** occur.

## Error Message

```
Warning: An error occurred during hydration. The server HTML was replaced with
client content in <#document>.

Error: Hydration failed because the server rendered HTML didn't match the client.
...
Warning: useId produced a mismatched id during hydration.
  Server: ":r2j:"
  Client: ":r7:"
```

## Root Cause Analysis

### 1. RSC Payloads Are Identical

We compared the full RSC flight payload (`__next_f.push([1, "..."])`) between Bun dev
and Node dev. The `c:` layout tree and all entries are identical. The bug is not in
RSC generation.

### 2. Client Module Load Timing Differs

Bun compiles JavaScript bundles on-demand (lazily per-request). The first time a client
component module is requested, it takes significantly longer than in Node:

- **Node dev**: The `$L17` client module promise (PlayerProvider) resolves after ~30 render passes
- **Bun dev**: The same promise resolves after ~149 render passes

This was confirmed by instrumenting `throwException` in `react-dom-client.development.js`
to log each render pass.

### 3. The Outlet Suspense Boundary Gets Wrong `treeContextId`

React's `useId()` generates IDs using `treeContextId`, a bitmask built by
`pushTreeFork`/`pushTreeId` as React traverses the fiber tree. It is reset per render.

The RSC outlet Suspense boundary (`__next_outlet_boundary__` / `InnerLayoutRouter`)
is mounted by `mountDehydratedSuspenseComponent` which saves the current
`treeContextId` into `memoizedState.treeContext` via `getSuspendedTreeContext()`:

```js
// react-dom-client.development.js — updateSuspenseComponent (null === current branch)
null !== renderLanes &&
  ((JSCompiler_object_inline_digest_2939 = {
    dehydrated: renderLanes,
    treeContext: getSuspendedTreeContext(),  // ← saves current treeContextId
    retryLane: 536870912,
    hydrationErrors: null
  }),
  (workInProgress.memoizedState = JSCompiler_object_inline_digest_2939),
  ...)
```

When the outlet boundary is first **committed** (which only happens on a successful,
non-thrown render), the `treeContextId` at that position depends on what components
rendered above it and how many Suspense boundaries are active.

In Bun dev, the `PlayerProvider` client module is still loading when the first few
render passes occur. React inserts a client-component Suspense boundary around
`PlayerProvider` (for the module promise). When this boundary is pending, the tree
structure above the outlet boundary is different from the fully-resolved SSR structure.
With 149 render passes before the module resolves, the outlet boundary's first
successful commit happens under a tree context shaped by the intermediate state.

**Result:**
- **Bun**: outlet boundary committed with `treeContext = {id: 471, overflow: "ebmlb"}`
- **Node**: outlet boundary committed with `treeContext = {id: 1885, overflow: "peqlb"}`
- **SSR**: outlet boundary's children expected a specific treeContextId that matches
  neither of the above in the Bun case

### 4. treeContext Is Saved from the Wrong Render

The core invariant that breaks:

> `getSuspendedTreeContext()` in `mountDehydratedSuspenseComponent` is supposed to
> capture the position in the tree that **matches the server render**. However, if
> the client renders the tree in a structurally different state (e.g. a client component
> above is still loading), the captured `treeContextId` will not match the server's.

When `restoreSuspendedTreeContext(workInProgress, current)` is later called to hydrate
the boundary's children (in the happy path):

```js
// happy path — isSuspenseInstancePending=false
(current = prevState.treeContext),
null !== current && restoreSuspendedTreeContext(workInProgress, current),
(workInProgress = mountSuspensePrimaryChildren(...))
```

...it restores the **wrong** `treeContextId` (the one from the flawed first commit),
so `useId()` inside the boundary produces a different value than on the server.

### 5. The Retry Path Does Not Restore treeContext

When the client module resolves and triggers a re-render, the outlet boundary takes
the `didReceiveUpdate || childLanes` branch and calls
`retrySuspenseComponentWithoutHydrating`. This function does not restore any
`treeContext` either, so the children get whatever `treeContextId` is current:

```js
function retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes) {
  // ← no restoreSuspendedTreeContext() call here
  reconcileChildFibers(workInProgress, current.child, null, renderLanes);
  current = mountSuspensePrimaryChildren(workInProgress, workInProgress.pendingProps.children);
  current.flags |= 2;
  workInProgress.memoizedState = null;
  return current;
}
```

## Where the Fix Should Live

The fundamental issue is that **the `treeContextId` saved by `getSuspendedTreeContext()`
at dehydrated Suspense mount time may not match the server's tree context** if the
client tree is in a different structural state at the time of the first commit.

The correct `treeContextId` for the boundary's children is encoded in the **server HTML**
(the dehydrated Suspense instance). React already reads the server's `treeContext` from
the boundary's `memoizedState.treeContext` — but that value was written from the
client's (potentially wrong) render, not from the server.

### Option A: Read treeContext from the Server HTML (Correct Fix)

The server embeds a `treeContextId` for each Suspense boundary in the RSC payload.
React should use **the server's treeContext** — not the client's `getSuspendedTreeContext()`
— when populating `memoizedState.treeContext` for dehydrated boundaries.

This may require Next.js to include the outlet boundary's `treeContextId` in the RSC
flight data (the `c:` chunk), which is not currently transmitted.

### Option B: Defer `memoizedState.treeContext` Save Until First Hydration (Partial Fix)

Instead of saving `getSuspendedTreeContext()` at mount time (when the client tree may
be in the wrong shape), save it at the point the boundary actually begins hydrating
children — which is when `isHydrating` is true and the client tree structure should
match the server's.

This would require React to not use the early-saved `treeContext` but instead use
the live `treeContextId` at hydration time, which is correct if the client has
finished loading all modules above this boundary.

### Option C: Gate `mountDehydratedSuspenseComponent` on Full Tree Resolution

Don't commit a dehydrated Suspense boundary as "mounted" until all client module
promises above it have resolved, ensuring the first commit sees the same tree
structure as SSR.

## Workaround (App-Level)

Convert client component providers to module-level stores (e.g. Zustand) so they
don't need to wrap RSC children via props. This prevents the Suspense boundary
caused by the client module from appearing above the outlet boundary.

```tsx
// Instead of:
<PlayerProvider>{children}</PlayerProvider>

// Use a module-level store — no wrapping, no boundary:
"use client";
const playerStore = createStore(...); // module singleton
export function usePlayerStore() { return useStore(playerStore); }
```

This is a valid workaround but contradicts the documented Next.js pattern of using
client component providers in the layout.

## Relevant React Source Code

All references to `react-dom-client.development.js` from `next@16.1.6`:

- `getSuspendedTreeContext()` — captures current treeContextId
- `restoreSuspendedTreeContext()` — restores a saved treeContextId
- `mountDehydratedSuspenseComponent` / `updateSuspenseComponent` (null === current branch) — saves treeContext at line ~11252
- `retrySuspenseComponentWithoutHydrating` — renders dehydrated boundary as client, does NOT restore treeContext
- `treeContextId`, `pushTreeId`, `pushTreeFork`, `popTreeContext` — the tree context encoding system used by `useId()`

## References

- Next.js discussion on RSC-children-through-client-component pattern: https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#supported-pattern-passing-server-components-to-client-components-as-props
- React `useId` hydration: https://react.dev/reference/react/useId
