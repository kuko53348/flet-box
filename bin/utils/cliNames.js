const RESERVED_WORDS = new Set(
  "arguments await break case catch class const continue debugger default delete do else enum eval export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield"
    .split(" "),
);

export const assertCliName = (name, kind) => {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) || RESERVED_WORDS.has(name)) {
    throw new Error(
      `Invalid ${kind} name "${name}". Use a JavaScript identifier (letters, numbers, "_" or "$"; it cannot start with a number).`,
    );
  }
};

export const parseBatchCount = (input, kind) => {
  if (!/^\d+$/.test(input)) return null;
  const count = Number(input);
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new Error(`${kind} count must be a positive whole number.`);
  }
  return Math.min(count, 10);
};
