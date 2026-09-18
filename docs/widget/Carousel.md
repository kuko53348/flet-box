# Carousel

## Overview
`Carousel` renders a horizontally sliding track of `items` with optional arrow buttons and dot indicators. Each item may be a widget (any DOM element), an image URL string, or a `{ src, alt }` object — the last two become a full-bleed `<img>` with `object-fit: cover`. Slides move by translating the track, so every item stays in the DOM at all times. The returned element exposes `next`, `prev`, `goTo`, and `getCurrentIndex`, and the widget returns `null` when `items` is empty.

## When to use
- Image galleries, product photos, hero banners, and onboarding slides.
- Any fixed set of full-width panels the user pages through one at a time.
- Auto-advancing showcases with `autoPlay` (it pauses while the pointer is over the carousel).

## Import

```javascript
import { Carousel } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Carousel } from "flet-box";

Carousel({
  items: [{ src: "/img/a.jpg", alt: "A" }, { src: "/img/b.jpg", alt: "B" }],
  height: 240,
});
```

## Item shapes

`items` accepts three forms, chosen per entry:

| Item | Rendered as |
| --- | --- |
| A widget / DOM element | Appended into the slide as-is, centered. |
| A string | Treated as an image URL: `<img src="…">` at 100% × 100% with `object-fit: cover`. |
| `{ src, alt }` | `<img src alt>` at 100% × 100% with `object-fit: cover`. |
| Anything else | An empty slide. |

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | array of widgets, strings, or `{ src, alt }` | `[]` | The slides. **An empty array makes the widget return `null`.** |
| `autoPlay` | boolean | `false` | Advances every `interval` ms. Pauses on `mouseenter`, resumes on `mouseleave`. Ignored when there is only one item. |
| `interval` | number | `3000` | Autoplay period in milliseconds. |
| `showArrows` | boolean | `true` | Renders the left/right circular arrow buttons (only with more than one item). |
| `showDots` | boolean | `true` | Renders the dot indicators (only with more than one item). |
| `infinite` | boolean | `true` | Wraps around at both ends instead of stopping. |
| `height` | number or string | `300` | Carousel height in pixels. |
| `width` | number or string | `'100%'` | Carousel width. |
| `borderRadius` | number | `12` | Corner radius in pixels; the track is clipped. |
| `onIndexChange` | `(index: number) => void` | — | Fires after every move, including dot clicks and autoplay. |
| `dotColor` | Color | `colors.gray300` | Inactive dot color. |
| `dotActiveColor` | Color | `colors.primary` | Active dot color. |
| `dotSize` | number | `8` | Dot height, and dot width while inactive. |
| `dotActiveSize` | number | `20` | Width of the active dot. |
| `buttonBgColor` | Color | `colors.surface` | Arrow button background. |
| `buttonIconColor` | Color | `colors.secondary` | Arrow chevron color. |
| `buttonSize` | number | `36` | Arrow button diameter in pixels. |
| `buttonIconSize` | number | `24` | Arrow chevron size in pixels. |
| `buttonTop` | number or string | `'46%'` | Vertical offset of both arrow buttons. |

These are the props specific to `Carousel`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `next()` — advances one slide, wrapping to the first when `infinite`.
- `prev()` — goes back one slide, wrapping to the last when `infinite`.
- `goTo(index)` — jumps to `index`. Out-of-range indexes are ignored.
- `getCurrentIndex()` — returns the current slide index.
- `_cleanup()` — stops the autoplay timer.

## Examples

### Everyday example

```javascript
import { Carousel } from "flet-box";

Carousel({
  items: ["/img/slide-1.jpg", "/img/slide-2.jpg", "/img/slide-3.jpg"],
  autoPlay: true,
  interval: 4000,
  height: 260,
  showDots: true,
  onIndexChange: (index) => console.log("slide", index),
});
```

### Full example

```javascript
import { Carousel, Column, Text, colors } from "flet-box";

const slide = (title, body) => Column({
  gap: 8,
  alignItems: "center",
  justifyContent: "center",
  children: [
    Text({ text: title, size: 24, weight: "bold", color: colors.text }),
    Text({ text: body, size: 14 }),
  ],
});

const carousel = Carousel({
  items: [
    slide("Fast", "Real DOM elements, no virtual DOM."),
    slide("Small", "Vanilla JS with zero dependencies."),
    { src: "/img/cover.jpg", alt: "Cover" },
  ],
  autoPlay: true,
  interval: 5000,
  showArrows: true,
  showDots: true,
  infinite: true,
  height: 320,
  width: "100%",
  borderRadius: 16,
  dotColor: colors.gray400,
  dotActiveColor: colors.primary,
  dotSize: 8,
  dotActiveSize: 24,
  buttonBgColor: "rgba(255,255,255,0.85)",
  buttonIconColor: colors.text,
  buttonSize: 40,
  buttonIconSize: 24,
  buttonTop: "46%",
  onIndexChange: (index) => console.log("slide", index),
});

// carousel.next();   carousel.prev();   carousel.goTo(0);   carousel.getCurrentIndex();
```

## Notes

- `items: []` returns `null`, not an element. Guard before mounting: `items.length ? Carousel({ items }) : Text({ text: "No slides" })`.
- Moves are throttled. Each `next()`/`prev()`/`goTo()` sets an internal transitioning flag that clears after 350ms, so a second call inside that window is silently ignored — including autoplay ticks that land mid-transition.
- Arrows and dots only render when `items.length > 1`; a single-item carousel is just the track.
- The track is `items.length * 100%` wide and each slide is `100 / items.length`% wide, so every item is mounted up front. Large galleries stay heavy.
- Slides center their content (`justify-content`/`align-items: center`) and clip overflow.
- `onIndexChange` fires synchronously with the new index, after the track and dots are updated.
- Dots are 4px-radius pills, not circles: the active one is `dotActiveSize` wide and `dotSize` tall.
- Arrow buttons are plain positioned `div`s with a Material chevron, not `Button` widgets.
- With `infinite: false`, `next()` on the last slide and `prev()` on the first do nothing.
- `_cleanup()` clears the autoplay interval; autoplay also attaches `mouseenter`/`mouseleave` listeners to the container.

## Related widgets
- [Image](Image.md)
- [Stack](Stack.md)
- [Pagination](Pagination.md)
- [Icon](Icon.md)
- [GridView](GridView.md)

---

## Continue reading

- **Previous:** [TreeView](TreeView.md)
- **Next:** [InstallButton](InstallButton.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (4 of 5).
