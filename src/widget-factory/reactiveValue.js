/**
 * @file reactiveValue.js
 * @description
 * The reactive-prop protocol shared by `useState`, the widget factory and the
 * prop pipeline.
 *
 * A prop value may be a *reactive value*: an object or function flagged with
 * `_isReactive` that reports the current value of a state key. The factory
 * resolves it whenever the prop is applied, and — when the value carries a
 * `_stateKey` — it also **subscribes** the widget to that key so a later change
 * updates only this widget instead of re-rendering the whole app.
 *
 * Two shapes are supported:
 *
 *  - **Live** (what `useState` returns): a callable that reads the store on every
 *    call. `valueOf`/`toString` also read live, so `${count}`, `count + 1` and
 *    CSS assignment all get the current value.
 *  - **Snapshot** (legacy): an object with a frozen `_value`. Still resolved, but
 *    it cannot auto-subscribe because it has no live source.
 *
 * @module widget-factory/reactiveValue
 */

/**
 * True while `resolveReactive` is reading a value on behalf of the factory.
 *
 * The distinction matters: a read the FACTORY performs (to fill a prop) is a
 * direct binding, but a read the COMPONENT performs (`${count}`, `count > 3`,
 * `count.valueOf()`) means the value also drives structure or computation, so the
 * app has to re-run as well. Reconciling the two is what keeps
 * `Text({ text: count })` surgical without breaking a sibling conditional.
 */
let resolving = false;

/**
 * Depth of the component-render pass, so reads in an event handler or a timer
 * (which run outside the pass) do not mark a key as structurally read.
 */
let renderPassDepth = 0;

/**
 * Keys the component read structurally during the pass that just finished.
 *
 * Rebuilt by every render pass: a component re-reads everything it consumes, so
 * what the last pass saw is the complete picture. Keeping the keys of *earlier*
 * passes instead would pin the app to full re-renders forever after one
 * conditional read, which is exactly what the surgical binding exists to avoid.
 */
let structuralKeys = new Set();

/** The keys collected by the pass currently running, or `null` between passes. */
let passKeys = null;

/** Marks the start of a component-render pass. */
export const beginRenderPass = () => {
  if (renderPassDepth === 0) passKeys = new Set();
  renderPassDepth++;
};

/** Marks the end of a component-render pass and publishes what it observed. */
export const endRenderPass = () => {
  if (renderPassDepth === 0) return;
  renderPassDepth--;
  if (renderPassDepth === 0) {
    if (passKeys) structuralKeys = passKeys;
    passKeys = null;
  }
};

/**
 * True when the last render pass consumed `key` structurally, so a change to it
 * needs an app render on top of the surgical prop patch.
 *
 * @param {string} key
 * @returns {boolean}
 */
export const isStructuralRead = (key) => structuralKeys.has(key);

/**
 * True when `val` is a reactive value (live or snapshot).
 *
 * @param {*} val
 * @returns {boolean}
 */
export const isReactive = (val) => Boolean(val) && val._isReactive === true;

/**
 * The state key a reactive value is bound to, or `null` when it is not bound.
 *
 * @param {*} val
 * @returns {string|null}
 */
export const reactiveKeyOf = (val) => (isReactive(val) ? val._stateKey ?? null : null);

/**
 * Resolves a reactive value to its current value. Plain values pass through.
 *
 * A live value is invoked, which is what makes it stay current: every time the
 * prop is re-applied the store is read again. The read is flagged as a factory
 * read so it is not mistaken for a structural one.
 *
 * @param {*} val
 * @returns {*}
 */
export const resolveReactive = (val) => {
  if (typeof val === "function" && val._isReactive) {
    // Save and restore instead of clearing: a reactive whose `valueOf` reads
    // another one would otherwise leave the inner read flagged as the factory's
    // and the outer one reported as a structural read.
    const wasResolving = resolving;
    resolving = true;
    try {
      return val();
    } finally {
      resolving = wasResolving;
    }
  }
  if (val && typeof val === "object" && val._isReactive === true) {
    return val._value !== undefined ? val._value : val.valueOf();
  }
  return val;
};

/**
 * Builds the live reactive value returned by `useState`.
 *
 * It is a **function** (so `resolveReactive` calls it and always gets the
 * current value) decorated with `valueOf`/`toString` (so template literals and
 * arithmetic work) and a `_value` getter (so the legacy `state._value` read
 * keeps working — now live instead of frozen).
 *
 * Every read that the component itself performs during a render pass is recorded
 * in the pass's structural-key set, because such a read means the value is
 * consumed structurally and the app must re-render too.
 *
 * @param {() => *} read - Reads the current value from the store.
 * @param {string} key - The state key this value is bound to.
 * @returns {Function} The live reactive value.
 */
export const createReactiveValue = (read, key) => {
  const live = () => {
    const value = read();
    if (!resolving && passKeys) passKeys.add(key);
    return value;
  };
  live._isReactive = true;
  live._stateKey = key;
  live.valueOf = () => live();
  live.toString = () => String(live());
  Object.defineProperty(live, "_value", {
    get: () => live(),
    configurable: true,
  });
  return live;
};

export default {
  isReactive,
  reactiveKeyOf,
  resolveReactive,
  createReactiveValue,
  isStructuralRead,
  beginRenderPass,
  endRenderPass,
};
