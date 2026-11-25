# vocab-ui

The component system shared by the study app (`apps/www`) and the video-mining review app (`apps/video-mining`), with its Storybook.

## Using it

1. Add the dependency: `"vocab-ui": "workspace:*"`.
2. Import the theme right after Tailwind in the app's stylesheet:

   ```css
   @import "tailwindcss";
   @import "vocab-ui/theme.css";
   ```

   Tailwind doesn't scan workspace packages, so without this the components' classes are never generated. The theme also defines:
   - the `hocus` variant (hover on devices that can hover, or keyboard focus, but not while pressed) and the `pressed` variant, both matching react-aria's data attributes;
   - `grid-stack` and `grid-stack-item`, which stack children in one grid cell so the container is as big as its biggest child.
3. Import each component from its own entry point: `import { Kbd } from "vocab-ui/Kbd"`. `package.json` `exports` lists them.

Fonts are up to each app. The study app loads Geist through `next/font` and maps `font-sans`/`font-mono` to it in its `tailwind.config.mjs`.

## What's here

| Entry point | Contents |
| --- | --- |
| `Button`, `Checkbox`, `TextField` | react-aria components in the study app's black-border style. |
| `Kbd` | A keyboard shortcut hint. Hidden below `md`. Inverts with a `group` parent on hover, focus and press. Takes `className`. |
| `Skeleton` | Loading placeholder. |
| `HskBadge`, `HskFilter` | HSK level badge, and the level filter used on the dictionary page. |
| `hsk` | `hskLevels`, the `HskLevel` type (same values as the study app's Prisma enum), `hskClasses` and `noHskClasses`. |
| `MotionProvider` | `LazyMotion` with `domAnimation`. `Checkbox` and `HskFilter` animate with `motion/react-m`, so they need it above them. |
| `coreClasses` | `buttonBehaviorClasses`, the shared button look, for links styled as buttons. |
| `cn` | `clsx` + `tailwind-merge`. |

Components here must not depend on Next.js or on either app. Anything that needs the Next.js router or `Link` stays in `apps/www/src/components`.

## Storybook

```bash
bun run storybook        # http://localhost:6006
bun run build-storybook
```

Stories sit next to their components (`*.stories.tsx`). `.storybook/preview.tsx` wraps every story in `MotionProvider`, and `preview.css` loads Tailwind, the theme and Geist.
