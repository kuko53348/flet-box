import {
  runApp,
  Container,
  Column,
  Row,
  Text,
  Button,
  Icon,
  Input,
  Checkbox,
  ProgressBar,
  colors,
} from "../src/index.js";
import { SnackBar } from "../src/widgets/index.js";

/**
 * @fileoverview FletBox demo — a minimal task-list application.
 *
 * Showcases FletBox's declarative, dependency-free widget system:
 * - Reactive list rendering driven by a plain array (`tasks`).
 * - Direct DOM patching via `bodyRef.replaceChildren`.
 * - Composable widgets: Row, Column, Container, Text, Button, Checkbox,
 *   ProgressBar, Icon, Input, SnackBar.
 *
 * There is intentionally no bundler, no framework overhead, and no external
 * dependencies — pure ESM running straight in the browser.
 */

/**
 * The application's task list.
 *
 * Each entry is a plain object `{ text: string, done: boolean }`.
 *
 * @type {Array<{ text: string, done: boolean }>}
 */
let tasks = [];

/**
 * Reference to the Column widget that holds the task rows and progress
 * section. Populated during the initial `App()` call and then mutated in
 * place by `render()` via `replaceChildren` to avoid rebuilding the whole
 * widget tree on every update.
 *
 * @type {HTMLElement|null}
 */
let bodyRef = null;

/**
 * Shows a brief snack-bar notification to the user.
 *
 * @param {string} message - The text to display.
 * @param {"normal"|"success"|"warning"|"info"|"error"} [type="normal"] -
 *   Visual style of the notification.
 */
const notify = (message, type = "normal") => {
  SnackBar({ message, type, duration: 1600 });
};

/**
 * Reads the current value from an input element, creates a new task, and
 * triggers a re-render.
 *
 * Shows a warning notification and bails early when the input is empty.
 * Task text is capped at 60 characters to keep rows readable.
 *
 * @param {HTMLInputElement|null} inputEl - The native `<input>` element to
 *   read the task text from. When null or empty, the function returns early.
 */
const addTask = (inputEl) => {
  const value = inputEl && inputEl.value ? inputEl.value.trim() : "";
  if (!value) {
    notify("Escribe una tarea primero", "warning");
    return;
  }
  tasks.push({ text: value.slice(0, 60), done: false });
  inputEl.value = "";
  inputEl.focus();
  render();
  notify("Tarea añadida", "success");
};

/**
 * Toggles the completion state of a task at the given index and re-renders.
 *
 * @param {number} index - Zero-based index of the task in the `tasks` array.
 */
const toggle = (index) => {
  tasks[index].done = !tasks[index].done;
  render();
};

/**
 * Removes a task at the given index, re-renders, and notifies the user which
 * task was deleted.
 *
 * @param {number} index - Zero-based index of the task in the `tasks` array.
 */
const remove = (index) => {
  const [removed] = tasks.splice(index, 1);
  render();
  notify(`"${removed.text}" eliminada`);
};

/**
 * Removes all completed tasks from the list and re-renders.
 *
 * Shows a warning notification when there are no completed tasks to clear.
 */
const clearDone = () => {
  const doneCount = tasks.filter((t) => t.done).length;
  if (!doneCount) {
    notify("No hay completadas por limpiar", "warning");
    return;
  }
  tasks = tasks.filter((t) => !t.done);
  render();
  notify(`${doneCount} completada${doneCount > 1 ? "s" : ""} eliminada${doneCount > 1 ? "s" : ""}`, "info");
};

/**
 * Builds the row widget for a single task entry.
 *
 * Each row contains a Checkbox, the task text (struck through when done), and
 * a delete icon. All interactions are wired inline via closures.
 *
 * @param {{ text: string, done: boolean }} task - The task data to render.
 * @param {number} index - The task's position in the `tasks` array, used to
 *   identify it in toggle/remove handlers.
 * @returns {HTMLElement} A Row widget representing the task.
 */
const buildTaskRow = (task, index) => {
  const deleteIcon = Icon({ name: "delete", size: 20, color: colors.gray400 });
  deleteIcon.style.cursor = "pointer";
  deleteIcon.addEventListener("click", () => remove(index));

  return Row({
    gap: 10,
    alignItems: "center",
    width: "100%",
    padding: "8px 12px",
    borderRadius: 12,
    bgColor: "#ffffff",
    border: "1px solid " + colors.border,
    children: [
      Checkbox({ checked: task.done, onCheck: () => toggle(index), size: 20 }),
      Container({
        flex: 1,
        child: Text({
          text: task.text,
          size: 14,
          color: task.done ? colors.gray400 : colors.text,
          styles: task.done ? ["strikethrough"] : [],
        }),
      }),
      deleteIcon,
    ],
  });
};

/**
 * Re-renders the dynamic section of the UI inside `bodyRef`.
 *
 * Computes the completion percentage, rebuilds the progress bar, the task
 * rows (or an empty-state message), and the footer summary row, then swaps
 * all children of `bodyRef` atomically via `replaceChildren` to minimise DOM
 * thrashing.
 */
const render = () => {
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const children = [];

  // Progress section — shows completion percentage and a visual progress bar.
  children.push(
    Column({
      gap: 6,
      width: "100%",
      children: [
        Row({
          justifyContent: "space-between",
          children: [
            Text({ text: "Completado", size: 12, weight: "bold", color: colors.textSecondary }),
            Text({ text: `${pct}%`, size: 12, weight: "bold", color: colors.primary }),
          ],
        }),
        ProgressBar({ value: pct, height: 8, color: colors.primary }),
      ],
    }),
  );

  if (total === 0) {
    // Empty state — shown when there are no tasks yet.
    children.push(
      Text({
        text: "Sin tareas por ahora ✨ añade la primera abajo",
        size: 14,
        color: colors.textSecondary,
        textAlign: "center",
      }),
    );
  } else {
    tasks.forEach((task, i) => children.push(buildTaskRow(task, i)));
  }

  // Footer row — summary count and "clear completed" action.
  children.push(
    Row({
      justifyContent: "space-between",
      alignItems: "center",
      children: [
        Text({ text: `${done} / ${total} completadas`, size: 12, color: colors.textSecondary }),
        Button({
          text: "Limpiar completadas",
          size: "small",
          variant: "text",
          textColor: colors.danger,
          onPress: clearDone,
        }),
      ],
    }),
  );

  bodyRef.replaceChildren(...children);
};

/**
 * Root application component for the task-list demo.
 *
 * Sets up `bodyRef`, wires the Enter-key shortcut on the input field, calls
 * `render()` for the initial empty state, and returns the full widget tree.
 *
 * @returns {HTMLElement} The top-level Container that hosts the entire app UI.
 */
const App = () => {
  bodyRef = Column({ gap: 10, width: "100%", children: [] });

  const inputWrap = Input({
    placeholder: "Escribe una tarea y pulsa Enter…",
    fullWidth: true,
  });
  const inputEl = inputWrap.querySelector("input");
  if (inputEl) {
    inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") addTask(inputEl);
    });
  }

  render();

  return Container({
    minHeight: "100vh",
    justifyContent: "center",
    alignItems: "center",
    bgColor: colors.background,
    padding: 24,
    child: Container({
      width: 420,
      maxWidth: "100%",
      padding: 24,
      borderRadius: 24,
      bgColor: colors.surface,
      border: "1px solid " + colors.border,
      child: Column({
        gap: 16,
        children: [
          // Header — app title and subtitle
          Row({
            gap: 12,
            alignItems: "center",
            children: [
              Icon({ name: "task_alt", size: 32, color: colors.primary }),
              Column({
                children: [
                  Text({ text: "Mis tareas", size: 22, weight: "bold", color: colors.text }),
                  Text({
                    text: "Demo FletBox · un solo corazón, widgets declarativos, 0 dependencias",
                    size: 12,
                    color: colors.textSecondary,
                  }),
                ],
              }),
            ],
          }),
          // Input row — text field + add button
          Row({
            gap: 8,
            alignItems: "center",
            children: [
              inputWrap,
              Button({ text: "Añadir", onPress: () => addTask(inputEl) }),
            ],
          }),
          // Dynamic body — progress bar, task rows, footer
          bodyRef,
          // Attribution footer
          Text({ text: "Hecho con FletBox · ESM puro", size: 11, color: colors.gray400, textAlign: "center" }),
        ],
      }),
    }),
  });
};

runApp(App, "root");
