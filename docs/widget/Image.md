# Image

## Overview
`Image` renders an `<img>` element. It is a thin wrapper: props are forwarded to the underlying image, so you use standard attributes like `src`, `alt`, `width`, and `height`, plus any common style props. Unknown CSS properties (such as `objectFit`) are applied as inline styles.

## When to use
- Display a picture from a URL or a local path.
- Show avatars, thumbnails, banners, or responsive media.

## Import

```javascript
import { Image } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Image } from "flet-box";

Image({ src: "https://placehold.co/200x120", alt: "Placeholder" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | string | — | Image URL or path. |
| `alt` | string | — | Alternative text for accessibility. |
| `width` | Size | — | Displayed width (number = pixels, or a CSS string). |
| `height` | Size | — | Displayed height. |

These are the props specific to `Image`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Image } from "flet-box";

Image({
  src: "/assets/cover.png",
  alt: "Cover",
  width: "100%",
  borderRadius: 12,
  style: { objectFit: "cover" },
});
```

### Full example

```javascript
import { Column, Image, Text } from "flet-box";

Column({
  gap: 8,
  children: [
    Image({
      src: "/assets/photo.jpg",
      alt: "Photo",
      width: 320,
      height: 200,
      borderRadius: 16,
      style: { objectFit: "cover" },
    }),
    Text({ text: "A caption below the image", size: 14 }),
  ],
});
```

## Notes

- Props are forwarded to the native `<img>`; unrecognized CSS props (like `objectFit`) become inline styles.
- Always provide `alt` for accessibility.

## Related widgets
- [Icon](Icon.md)
- [Avatar](Avatar.md)
- [Container](Container.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [Icon](Icon.md)
- **Next:** [Button](Button.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (7 of 7).
