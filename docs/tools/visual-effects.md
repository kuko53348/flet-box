# Visual effects

## Overview
Apply ready-made visual treatments directly to an HTML element: stripes, shimmer, glow, an indeterminate progress sweep, and a pulse. `injectKeyframes` lets you add custom CSS keyframes globally.

## When to use
- Add a loading shimmer to placeholders.
- Animate a progress feel with indeterminate or pulse.
- Make an element glow or carry striped accents without writing CSS.

## Import

```javascript
import { applyShimmer, applyGlow, removeStripes, injectKeyframes } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `applyStripes` | `applyStripes(element, options?)` | `void` | Diagonal stripes overlay. |
| `removeStripes` | `removeStripes(element)` | `void` | Remove the stripes. |
| `applyShimmer` | `applyShimmer(element, options?)` | `void` | Animated shimmer sweep. |
| `applyGlow` | `applyGlow(element, options?)` | `void` | Outer glow animation. |
| `applyIndeterminate` | `applyIndeterminate(element, options?)` | `void` | Indeterminate progress sweep (like a loader). |
| `applyPulse` | `applyPulse(element, options?)` | `void` | Pulsing scale animation. |
| `injectKeyframes` | `injectKeyframes(name, keyframes)` | `void` | Register a global CSS keyframes rule. |

Options object per effect:

| Effect | Options |
| --- | --- |
| `applyStripes` | `{ color?, size?, angle?, animated?, duration? }` |
| `applyShimmer` | `{ highlightColor?, baseColor?, duration? }` |
| `applyGlow` | `{ color?, intensity?, duration? }` |
| `applyIndeterminate` | `{ duration?, width? }` |
| `applyPulse` | `{ scale?, duration? }` |

## Examples

### Everyday example

```javascript
import { applyShimmer } from "flet-box";

const skeleton = Container({ width: 200, height: 24, backgroundColor: "#e2e8f0" });

applyShimmer(skeleton, { duration: "1.6s" });
```

### Full example

```javascript
import { Container, applyStripes, removeStripes, applyGlow } from "flet-box";

const card = Container({ padding: 20, backgroundColor: "#fffbe6" });

applyStripes(card, { color: "#f59e0b33", size: 12, animated: true });
applyGlow(card, { color: "#f59e0b", intensity: 8 });

// later, clean the stripes:
removeStripes(card);
```

## Notes

- Effects mutate the element's style in place; to fully revert the static ones use their matching `remove*` function.
- Animated effects use injected keyframes — you can override durations through the options.
- For the widget-level equivalents see [AnimatedBox/AnimatedText](animation.md), and use [Skeleton](../widget/Skeleton.md) for placeholders styled by props.

## Related pages
- [Markdown, code & HTML](markdown.md) — previous chapter.
- [Widget introspection](introspection.md) — next chapter.
- [Skeleton widget](../widget/Skeleton.md) — placeholder widgets.

---

## Continue reading

- **Previous:** [Markdown, code & HTML](markdown.md)
- **Next:** [Widget introspection](introspection.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (9 of 12).