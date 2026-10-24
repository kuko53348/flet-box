// scale.js - The framework's design scales: the numbers every widget default is drawn from.

/**
 * The clean-UI contract, expressed as data instead of prose.
 *
 * These are the same scales `flet-box check-ui` enforces against an app's own
 * source. They live here because a gate that only reads the app cannot make the
 * app clean: it can reject a `padding: 21`, but the widget defaults the app never
 * typed already decide the rhythm, the radius and the tap size of every screen.
 * A default below the Fitts floor is a rule the framework breaks on the user's
 * behalf, and no amount of app-side linting can undo it.
 *
 * Units are framework units, not CSS pixels. A numeric length prop goes through
 * the factory's `toREM` (`src/utils/units.js`), so `40` is emitted as `2.5rem`:
 * 40px at the 16px base, and *bigger* when the reader raises their browser font.
 * That is the point — a tap target written in rem obeys the accessibility
 * setting, while the 44px the guidelines quote is a fixed-pixel floor that
 * shrinks in relative terms the moment the type grows.
 *
 * Depth is the exception: `SHADOW_LEVELS` ships raw `px` inside the box-shadow
 * string on purpose, because a shadow that scales with the reader's font size
 * stops matching the surface it lifts.
 */

/** A radius this large clamps to half the box: a pill, whatever the widget's size. */
export const PILL = 999;

/** The 8-based rhythm, with the two steps a real layout needs (18 for field text, 96 for hero gutters). */
export const SPACING_SCALE = new Set([0, 4, 8, 12, 16, 18, 24, 32, 40, 48, 64, 96]);

/**
 * Corner radii. `999` is a pill, `0` a flush edge — both are decisions, not omissions.
 *
 * The scale reaches 24 on purpose. The nesting rule (`outer = inner + padding`) is
 * arithmetic, not taste: a 16-radius tile inside 8 of padding *needs* a 24 card, so a
 * scale that stops at 16 makes the correct radius illegal and pushes the screen to a
 * pill it did not ask for.
 */
export const RADIUS_SCALE = new Set([0, 4, 8, 12, 16, 20, 24, PILL]);

/** Type sizes. Two steps per jump: a 15 next to a 16 reads as a mistake, not as hierarchy. */
export const TYPE_SCALE = new Set([12, 14, 16, 18, 24, 32, 40, 48]);

/** Fitts: the smallest pressable box a finger reliably hits. */
export const TAP_MINIMUM = 40;

/** The reading size a control's own label may not fall under. */
export const LABEL_TEXT = 14;
