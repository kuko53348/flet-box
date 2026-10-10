WIDGET_DOCS = {
    "Radio": {
        "summary": "A single-selection control that renders a circular radio button. Radios sharing the same name form a group where only one can stay selected.",
        "when": "Use Radio when the user must pick exactly one option from a short, always-visible list.",
        "related": ["Switch", "Checkbox", "Dropdown"],
        "tips": [
            "Give Radios that answer the same question the same name; selecting one clears the others in that group.",
            "Set selected for the initial choice and let onSelect write the change back into your own state.",
        ],
        "accessibility": [
            "The circle carries no visible label on its own; render a Text beside it and never rely on color alone.",
        ],
        "behavior": [
            "Clicking an already-selected Radio is a no-op, so onSelect only fires when the selection actually changes.",
            "The returned element exposes select(), unselect() and isSelected() for programmatic control.",
        ],
        "basic": '''const plan = Radio({
  label: "Monthly",
  name: "billing",
  onSelect: (value) => console.log(value),
});''',
        "normal": '''const monthly = Radio({
  label: "Monthly plan",
  name: "billing",
  selected: true,
  activeColor: "#2563eb",
  onSelect: (value) => console.log("billing:", value),
});''',
        "full": '''const option = Radio({
  label: "Express shipping",
  name: "shipping",
  selected: false,
  disabled: false,
  activeColor: "#16a34a",
  size: 24,
  onSelect: (value) => {
    console.log("shipping changed:", value);
  },
});''',
    },
    "Switch": {
        "summary": "An iOS-style toggle switch with a sliding knob that represents an on/off state.",
        "when": "Use Switch for settings that take effect immediately, such as dark mode or notifications.",
        "related": ["Checkbox", "Radio", "ListTile"],
        "tips": [
            "Reserve Switch for immediate settings and use Checkbox when the choice is part of a form you submit.",
            "onToggle receives the new boolean, so you can store it directly in your state.",
        ],
        "accessibility": [
            "Pair the switch with a nearby text label and expose the boolean state; do not encode on/off with color only.",
        ],
        "behavior": [
            "Switch works uncontrolled when value is omitted: clicking toggles the internal state and fires onToggle.",
            "The returned element exposes getValue() and updateValue(v) to read or set the state without a click.",
        ],
        "basic": '''const darkMode = Switch({
  label: "Dark mode",
});''',
        "normal": '''const notifications = Switch({
  value: true,
  label: "Notifications",
  activeColor: "#16a34a",
  onToggle: (value) => console.log("notifications:", value),
});''',
        "full": '''const wifi = Switch({
  value: false,
  label: "Wi-Fi",
  size: "large",
  activeColor: "#2563eb",
  disabled: false,
  onToggle: (value) => {
    console.log("wifi toggled:", value);
  },
});''',
    },
    "Checkbox": {
        "summary": "A square checkbox with a check mark that represents an independent true/false choice.",
        "when": "Use Checkbox when several options can be selected at once, or when confirming a single item in a form.",
        "related": ["Switch", "Radio", "ListTile"],
        "tips": [
            "Use Checkbox inside forms where several options may be true together; use Switch for one immediate on/off setting.",
            "onCheck fires with the new boolean, so write it straight into your state.",
        ],
        "accessibility": [
            "The check box needs an adjacent visible label; assistive tech cannot infer meaning from the tick glyph alone.",
        ],
        "behavior": [
            "Uncontrolled when checked is omitted; the widget tracks its own state and reports changes through onCheck.",
            "The returned element exposes setChecked(value) and getChecked() for programmatic control.",
        ],
        "basic": '''const terms = Checkbox({
  label: "Accept terms",
});''',
        "normal": '''const remember = Checkbox({
  checked: true,
  label: "Remember me",
  activeColor: "#2563eb",
  onCheck: (checked) => console.log("remember:", checked),
});''',
        "full": '''const updates = Checkbox({
  checked: false,
  label: "Email me product updates",
  size: 24,
  activeColor: "#7c3aed",
  disabled: false,
  onCheck: (checked) => {
    console.log("updates:", checked);
  },
});''',
    },
    "Dropdown": {
        "summary": "A select control that shows the current choice and opens a menu of options when clicked.",
        "when": "Use Dropdown when the option list is long enough that radios would crowd the page.",
        "related": ["Radio", "Checkbox", "Input"],
        "tips": [
            "Pass objects with value/label when the value sent to onChange must differ from the text shown, such as an id versus a name.",
            "Set clearable: true to give users an explicit way back to no selection.",
        ],
        "accessibility": [
            "Supply the label prop so the trigger has a visible field name, and ensure the menu can be opened without a mouse.",
        ],
        "behavior": [
            "The option menu is portaled to document.body by default and repositions on scroll/resize; set portal: false to keep it inline.",
            "The returned element exposes value, open(), close() and update(), and removes its listeners on unmount.",
        ],
        "basic": '''const city = Dropdown({
  options: ["Berlin", "Paris", "Tokyo"],
  placeholder: "Choose a city",
});''',
        "normal": '''const role = Dropdown({
  label: "Role",
  options: ["Admin", "Editor", "Viewer"],
  value: "Editor",
  onChange: (value) => console.log("role:", value),
});''',
        "full": '''const country = Dropdown({
  label: "Country",
  variant: "outlined",
  size: "medium",
  options: [
    { value: "us", label: "United States" },
    { value: "de", label: "Germany" },
    { value: "jp", label: "Japan" },
  ],
  value: "de",
  clearable: true,
  portal: true,
  borderRadius: 10,
  bgColor: "#ffffff",
  textColor: "#0f172a",
  onChange: (value, label) => {
    console.log("selected:", value, label);
  },
});''',
    },
    "Slider": {
        "summary": "A draggable range input that selects a numeric value along a track between min and max.",
        "when": "Use Slider when a value benefits from direct manipulation, such as volume, price or opacity.",
        "related": ["Rating", "ProgressBar", "Input"],
        "tips": [
            "onChanged fires continuously while dragging; use onChangeEnd for the value to commit, such as a filter request.",
            "Set step to snap to meaningful increments instead of every integer.",
        ],
        "accessibility": [
            "A slider needs a visible label or value text; showValue displays the current value so it is not conveyed by thumb position alone.",
        ],
        "behavior": [
            "Dragging the track or thumb updates the value and fires onChanged; releasing fires onChangeEnd once.",
            "The returned element exposes value, min, max, step, setValue() and getValue(), and disconnects its ResizeObserver on unmount.",
        ],
        "basic": '''const volume = Slider({
  value: 40,
});''',
        "normal": '''const volume = Slider({
  value: 60,
  min: 0,
  max: 100,
  step: 5,
  onChanged: (value) => console.log("volume:", value),
});''',
        "full": '''const price = Slider({
  value: 250,
  min: 0,
  max: 1000,
  step: 50,
  color: "#2563eb",
  trackColor: "#e2e8f0",
  thumbSize: 24,
  showValue: true,
  valuePrefix: "$",
  showMarks: true,
  marks: [
    { value: 0, label: "$0" },
    { value: 500, label: "$500" },
    { value: 1000, label: "$1000" },
  ],
  onChanged: (value) => console.log("price:", value),
  onChangeEnd: (value) => console.log("final:", value),
});''',
    },
    "SnackBar": {
        "summary": "A transient toast that appears at the edge of the screen, reports a short message, and dismisses itself.",
        "when": "Use SnackBar to confirm a completed action or surface a brief, non-blocking notice.",
        "related": ["AlertDialog", "Modal", "Button"],
        "tips": [
            "Keep message short and use SnackBar for confirmations, not for information the user must act on.",
            "A duration of 0 keeps the toast open until you call close(); otherwise it auto-dismisses.",
        ],
        "accessibility": [
            "A SnackBar disappears on its own, so make sure the same information is available elsewhere and never required reading.",
        ],
        "behavior": [
            "The element is appended to document.body and auto-removed after duration; the returned controller has show(), close() and getElement().",
            "Calling close() early cancels the pending dismissal timer and slides the toast out.",
        ],
        "basic": '''const toast = SnackBar({
  message: "Saved",
});''',
        "normal": '''const toast = SnackBar({
  message: "Changes saved",
  type: "success",
  duration: 3000,
});''',
        "full": '''const toast = SnackBar({
  message: "Could not reach the server",
  type: "error",
  duration: 5000,
  bgColor: "#1e293b",
  color: "#ffffff",
  borderRadius: 12,
  elevation: 3,
});''',
    },
    "Modal": {
        "summary": "A centered dialog over a dimmed overlay that holds a title, content and a row of actions.",
        "when": "Use Modal when the user must focus on a task or read something without leaving the page.",
        "related": ["BottomSheet", "AlertDialog", "Card"],
        "tips": [
            "Modal manages its own overlay and appends it to document.body; call the returned open() and close() to control visibility.",
            "Use closeOnOverlayClick: false for destructive or data-entry dialogs that should not be dismissed by a stray click.",
        ],
        "accessibility": [
            "Modal does not move focus automatically; focus the first control or a close button when it opens.",
        ],
        "behavior": [
            "Returns a controller with open, close, toggle, destroy and an isOpen getter, plus updateContent, updateTitle and setLoading helpers.",
            "onOpen and onClose fire on state changes, and closeOnEsc installs an Escape listener that destroy() removes.",
        ],
        "basic": '''const dialog = Modal({
  title: "Welcome",
  content: "Thanks for signing up.",
});''',
        "normal": '''const profile = Modal({
  title: "Profile",
  content: "Update your account details.",
  closeOnOverlayClick: true,
  onClose: () => console.log("closed"),
});''',
        "full": '''const settings = Modal({
  title: "Settings",
  content: Column({
    gap: 12,
    children: [Switch({ label: "Dark mode" }), Switch({ label: "Compact" })],
  }),
  actions: [
    Button({ text: "Cancel", variant: "text" }),
    Button({ text: "Save", onPress: () => settings.close() }),
  ],
  closeOnOverlayClick: false,
  closeOnEsc: true,
  width: 480,
  borderRadius: 16,
  elevation: 8,
  overlayColor: "rgba(15, 23, 42, 0.5)",
  onOpen: () => console.log("opened"),
  onClose: () => console.log("closed"),
});''',
    },
    "BottomSheet": {
        "summary": "A panel that slides up from the bottom of the screen over a dimmed overlay.",
        "when": "Use BottomSheet for short, task-focused panels such as filters, share sheets or quick forms.",
        "related": ["Modal", "AlertDialog", "Card"],
        "tips": [
            "Reach for BottomSheet for lightweight panels and Modal when the content needs the user's full attention.",
            "closeOnDragDown only works together with a drag handle, so keep showDragHandle: true when enabling it.",
        ],
        "accessibility": [
            "Give the sheet a title so the panel has an accessible name, and keep the close action reachable by keyboard.",
        ],
        "behavior": [
            "Returns a controller with open, close, toggle and destroy; the overlay stays hidden until open() is called.",
            "Overlay clicks and Escape close the sheet, onOpen/onClose fire as it animates, and destroy() releases the listeners.",
        ],
        "basic": '''const sheet = BottomSheet({
  content: Text({ text: "Choose an action" }),
});''',
        "normal": '''const sheet = BottomSheet({
  title: "Share",
  content: Text({ text: "Share this document with your team." }),
  closeOnOverlayClick: true,
  onClose: () => console.log("closed"),
});''',
        "full": '''const filters = BottomSheet({
  title: "Filters",
  height: "60%",
  showDragHandle: true,
  closeOnDragDown: true,
  closeOnOverlayClick: true,
  showCloseButton: true,
  backgroundColor: "#ffffff",
  overlayColor: "rgba(15, 23, 42, 0.4)",
  borderRadius: 20,
  content: Column({
    gap: 12,
    children: [Switch({ label: "In stock" }), Checkbox({ label: "On sale" })],
  }),
  actions: [
    Button({ text: "Reset", variant: "text" }),
    Button({ text: "Apply", onPress: () => filters.close() }),
  ],
  onOpen: () => console.log("opened"),
  onClose: () => console.log("closed"),
});''',
    },
    "AlertDialog": {
        "summary": "A pre-styled confirmation dialog built on Modal, with a variant icon, message and confirm/cancel buttons.",
        "when": "Use AlertDialog when you need an explicit confirm or cancel decision from the user.",
        "related": ["Modal", "SnackBar", "Button"],
        "tips": [
            "Pick the variant that matches intent: danger for destructive actions, success for confirmations, warning when the user should pause.",
            "Set showCancel: false only for acknowledgements; most confirmations should let the user back out.",
        ],
        "accessibility": [
            "State the consequence in message and name the buttons by action such as Delete and Cancel instead of a generic OK.",
        ],
        "behavior": [
            "AlertDialog is a preset Modal: it returns { open, close, modal } and must be shown by calling open().",
            "onConfirm and onCancel run before the dialog closes; onClose fires for every dismissal, including Escape or overlay click.",
        ],
        "basic": '''const alert = AlertDialog({
  title: "Delete file?",
  message: "This action cannot be undone.",
});''',
        "normal": '''const alert = AlertDialog({
  title: "Remove item",
  message: "The item will be moved to trash.",
  confirmText: "Remove",
  cancelText: "Keep",
  onConfirm: () => console.log("removed"),
  onCancel: () => console.log("kept"),
});''',
        "full": '''const alert = AlertDialog({
  title: "Delete account",
  message: "All data will be permanently erased.",
  variant: "danger",
  confirmText: "Delete",
  cancelText: "Cancel",
  showCancel: true,
  width: 360,
  borderRadius: 20,
  onConfirm: () => console.log("confirmed"),
  onCancel: () => console.log("cancelled"),
  onClose: () => console.log("closed"),
});''',
    },
    "FloatingActionButton": {
        "summary": "A circular, elevated button that floats over content and can expand into a labeled pill.",
        "when": "Use FloatingActionButton for the single most important action on a screen, such as compose or create.",
        "related": ["Button", "Icon", "Card"],
        "tips": [
            "Keep one FloatingActionButton per screen; extended: true with a label makes the action explicit.",
            "mini: true shrinks the button for secondary floating actions.",
        ],
        "accessibility": [
            "A bare icon button needs a label; prefer extended: true with a visible label, or wrap it in a Tooltip so the action is discoverable.",
        ],
        "behavior": [
            "When onPress is set the button gains a click listener and a hover scale; both the scale and pointer style are disabled when disabled is true.",
            "The icon prop accepts either an icon name or an already-built Icon widget.",
        ],
        "basic": '''const add = FloatingActionButton({
  icon: "add",
});''',
        "normal": '''const compose = FloatingActionButton({
  icon: "edit",
  onPress: () => console.log("compose"),
});''',
        "full": '''const create = FloatingActionButton({
  icon: "add",
  label: "New project",
  extended: true,
  backgroundColor: "#2563eb",
  foregroundColor: "#ffffff",
  elevation: 8,
  margin: 24,
  onPress: () => console.log("create"),
});''',
    },
    "Stepper": {
        "summary": "A multi-step progress indicator that shows each step as a circle, number or icon and reveals the active step's content.",
        "when": "Use Stepper for guided flows such as checkout or onboarding where the user advances through ordered steps.",
        "related": ["ProgressBar", "Button", "Container"],
        "tips": [
            "Steps are clickable, so users can jump around; use onStepChange to validate a step before allowing the move.",
            "variant: icons pulls each step's icon; circles and numbers ignore it.",
        ],
        "accessibility": [
            "Expose the current position beyond the highlight color; showLabels: true gives every step visible text.",
        ],
        "behavior": [
            "Clicking a step or the Next/Back buttons calls onStepChange; the final step swaps Next for Finish, which fires onFinish.",
            "The returned element exposes goTo(index), next(), back() and getActiveStep() for imperative navigation.",
        ],
        "basic": '''const stepper = Stepper({
  steps: [
    { label: "Account", content: Text({ text: "Account details" }) },
    { label: "Done", content: Text({ text: "All set" }) },
  ],
});''',
        "normal": '''const stepper = Stepper({
  activeStep: 0,
  steps: [
    { label: "Cart", content: Text({ text: "Review your cart" }) },
    { label: "Address", content: Text({ text: "Shipping address" }) },
    { label: "Payment", content: Text({ text: "Payment method" }) },
  ],
  onStepChange: (index) => console.log("step:", index),
});''',
        "full": '''const checkout = Stepper({
  orientation: "vertical",
  variant: "icons",
  activeStep: 1,
  showLabels: true,
  showNavigation: true,
  nextLabel: "Continue",
  backLabel: "Previous",
  finishLabel: "Place order",
  steps: [
    { label: "Cart", icon: "shopping_cart", content: Text({ text: "Your cart" }) },
    { label: "Shipping", icon: "local_shipping", content: Text({ text: "Address" }) },
    { label: "Payment", icon: "credit_card", content: Text({ text: "Payment" }) },
  ],
  onStepChange: (index) => console.log("step:", index),
  onFinish: () => console.log("finished"),
});''',
    },
}
