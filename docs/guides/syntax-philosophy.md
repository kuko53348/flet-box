# FletBox syntax philosophy

FletBox is designed around the developer, not the other way around.

You should be able to describe an interface in a way that feels natural to you. Developers coming from Flet, Flutter, React, or vanilla JavaScript may use slightly different names for the same idea. FletBox is intentionally friendly to those styles.

## One idea, several comfortable names

Some props have aliases because different ecosystems use different words.

```javascript
Container({
  bgColor: "#eff6ff",
  padding: 16,
});
```

A developer coming from traditional web development may prefer:

```javascript
Container({
  backgroundColor: "#eff6ff",
  padding: "16px",
});
```

The goal is not to force one vocabulary. The goal is to make the intention obvious.

## Events that read naturally

Depending on your background, either event name may feel more familiar:

```javascript
Button({
  text: "Save",
  onPress: save,
});
```

```javascript
Button({
  text: "Save",
  onClick: save,
});
```

Both express the same human idea: run this function when the user activates the button.

## Children and composition

Flet and Flutter developers may think in terms of a single `child`:

```javascript
Container({
  child: Text({ text: "Hello" }),
});
```

React developers may prefer `children`:

```javascript
Container({
  children: [
    Text({ text: "Hello" }),
    Text({ text: "Welcome" }),
  ],
});
```

Use `child` for one child and `children` for several children when the widget supports both.

## Direct values or helper functions

FletBox keeps simple values simple:

```javascript
Container({
  padding: 16,
  margin: "8px 0",
});
```

You can also use helpers when you prefer an expressive style:

```javascript
import { margin, padding } from "flet-box";

Container({
  padding: padding({ horizontal: 20, vertical: 12 }),
  margin: margin({ top: 8, bottom: 16 }),
});
```

The first style is quick. The second style can make complex spacing more descriptive. Choose the one that makes your code easiest to read.

## Styling vocabulary

FletBox accepts familiar CSS-like values:

```javascript
Container({
  width: "100%",
  minHeight: "100vh",
  borderRadius: 12,
  bgColor: "#ffffff",
});
```

Numbers normally represent pixels. Strings can contain CSS units such as `%`, `vh`, `rem`, or `px`.

## Preferred and compatible syntax

For new projects, choose one style and use it consistently within a file. The examples in this documentation generally use the short, readable widget style:

```javascript
Text({ text: "Hello", size: 18, weight: "bold" });
```

Aliases exist to make migration and adoption easier. They are not a requirement to mix every style in the same component.

Think of the API in three layers:

- **Preferred syntax**: the clearest style recommended by the current documentation.
- **Friendly aliases**: equivalent names that help developers coming from another ecosystem.
- **Compatibility syntax**: older names preserved so existing projects do not break.

## The rule for documentation

Every widget page should answer three questions:

1. What does this widget represent?
2. What is the smallest example that works?
3. Which alternative names or styles can a developer use?

That is why each widget page contains a basic example, an everyday example, a full example, common prop explanations, and beginner tips.

## The rule for framework design

FletBox should adapt to the developer wherever that flexibility remains clear, testable, and maintainable.

Friendly syntax must still have:

- Clear documentation.
- Consistent behavior.
- Type declarations.
- Working examples.
- Tests for important aliases.
- A migration path when an alias changes.

This keeps the experience soft for beginners without making the framework mysterious for experienced developers.
