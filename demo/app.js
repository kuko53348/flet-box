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

let tasks = [];
let bodyRef = null;

const notify = (message, type = "normal") => {
  SnackBar({ message, type, duration: 1600 });
};

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

const toggle = (index) => {
  tasks[index].done = !tasks[index].done;
  render();
};

const remove = (index) => {
  const [removed] = tasks.splice(index, 1);
  render();
  notify(`“${removed.text}” eliminada`);
};

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

const render = () => {
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const children = [];

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
          Row({
            gap: 8,
            alignItems: "center",
            children: [
              inputWrap,
              Button({ text: "Añadir", onPress: () => addTask(inputEl) }),
            ],
          }),
          bodyRef,
          Text({ text: "Hecho con FletBox · ESM puro", size: 11, color: colors.gray400, textAlign: "center" }),
        ],
      }),
    }),
  });
};

runApp(App, "root");