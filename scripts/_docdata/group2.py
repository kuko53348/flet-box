WIDGET_DOCS = {
    "Image": {
        "summary": "Renders an image element from a URL or path. Supports fixed sizing, "
                   "object-fit modes, and a circular crop for avatars.",
        "when": "Use it whenever you need to show a photo, banner, thumbnail, or icon asset.",
        "related": ["Avatar", "Card", "Icon"],
        "tips": [
            "Set both width and height with fit: \"cover\" to avoid stretched or squashed art.",
            "Use circular: true instead of a full borderRadius when you want a perfect avatar crop.",
        ],
        "accessibility": [
            "Always pass alt so screen readers can describe the image; alt: \"\" marks it decorative.",
        ],
        "behavior": [
            "onLoad fires once the image decodes; onError fires when the src fails to load.",
            "onPress is attached to the wrapper, so the image behaves like a tappable tile.",
        ],
        "basic": '''const photo = Image({
  src: "/photo.jpg",
  alt: "Profile photo",
});''',
        "normal": '''const cover = Image({
  src: "/banner.jpg",
  alt: "Launch banner",
  width: 320,
  height: 180,
  fit: "cover",
  borderRadius: 12,
});''',
        "full": '''const teamPhoto = Image({
  src: "/team/anna.jpg",
  alt: "Anna at the keynote",
  width: 96,
  height: 96,
  fit: "cover",
  circular: true,
  onLoad: () => console.log("loaded"),
  onError: () => console.error("failed"),
  onPress: () => console.log("open profile"),
});''',
    },
    "Avatar": {
        "summary": "A compact identity chip that shows a profile image, the person's initials, "
                   "or a fallback icon. It falls back gracefully when no image is available.",
        "when": "Reach for it in headers, comments, list rows, and any place a user needs a face.",
        "related": ["Image", "ListTile", "Card"],
        "tips": [
            "Provide both src and name so initials render if the image fails.",
            "Use shape: \"circle\" for people and shape: \"rounded\" for organizations or bots.",
        ],
        "accessibility": [
            "The name prop is announced as the label, so always give a meaningful name.",
        ],
        "behavior": [
            "When src is missing or errors, the widget automatically shows initials from name.",
            "onPress makes the whole avatar interactive, which is useful for opening profiles.",
        ],
        "basic": '''const user = Avatar({
  name: "Ada Lovelace",
});''',
        "normal": '''const user = Avatar({
  src: "/avatars/ada.png",
  name: "Ada Lovelace",
  size: 48,
  shape: "circle",
});''',
        "full": '''const user = Avatar({
  src: "/avatars/ada.png",
  name: "Ada Lovelace",
  size: 64,
  shape: "rounded",
  bgColor: "#2563eb",
  textColor: "#ffffff",
  onPress: () => console.log("open profile"),
});''',
    },
    "Card": {
        "summary": "A rounded, optionally elevated surface that groups related content into a "
                   "single tappable unit.",
        "when": "Use it to present a self-contained block such as a summary, product, or stat.",
        "related": ["Container", "ListTile", "Button"],
        "tips": [
            "Keep elevation subtle (1-3) so stacked cards do not look noisy.",
            "Set showBorder: true for a flat look, or use elevation for a raised surface.",
        ],
        "accessibility": [
            "When onPress is set the whole card becomes a button; make its heading describe the action.",
        ],
        "behavior": [
            "Accepts either child for one widget or children for a stacked column of content.",
            "onPress fires for clicks anywhere inside the card surface.",
        ],
        "basic": '''const card = Card({
  child: Text({ text: "Hello" }),
});''',
        "normal": '''const card = Card({
  elevation: 2,
  padding: 16,
  borderRadius: 12,
  child: Text({ text: "Today's summary" }),
});''',
        "full": '''const card = Card({
  elevation: 3,
  padding: 20,
  borderRadius: 16,
  showBorder: true,
  borderColor: "#e2e8f0",
  borderWidth: 1,
  onPress: () => console.log("open report"),
  children: [
    Text({ text: "Weekly report", weight: "bold" }),
    Text({ text: "Revenue is up 12% this week." }),
  ],
});''',
    },
    "ListTile": {
        "summary": "A single row with leading, title, subtitle, and trailing slots. It is the "
                   "standard building block for settings, contacts, and menus.",
        "when": "Use it for any list row that needs an icon or avatar plus primary and secondary text.",
        "related": ["ListView", "Avatar", "Card"],
        "tips": [
            "leftItem and rightItem accept any widget, so you can drop in an Avatar or Switch.",
            "Set selected: true with selectedBgColor to highlight the active row.",
        ],
        "accessibility": [
            "Keep the title short and descriptive; it becomes the row's accessible label.",
        ],
        "behavior": [
            "divider draws a separator under the row; disabled blocks interaction and dims the tile.",
            "onPress fires when the row is tapped, unless disabled is true.",
        ],
        "basic": '''const tile = ListTile({
  title: "Settings",
});''',
        "normal": '''const tile = ListTile({
  title: "Notifications",
  subtitle: "Email and push alerts",
  onPress: () => console.log("open notifications"),
});''',
        "full": '''const tile = ListTile({
  leftItem: Avatar({ name: "Ada Lovelace", size: 40 }),
  title: "Ada Lovelace",
  subtitle: "Product designer",
  rightItem: Icon({ name: "chevron_right" }),
  selected: true,
  selectedBgColor: "#eff6ff",
  divider: true,
  paddingHorizontal: 16,
  paddingVertical: 12,
  onPress: () => console.log("open profile"),
});''',
    },
    "ProgressBar": {
        "summary": "A horizontal bar that visualizes completion from zero to max. It can show a "
                   "label and numeric value, or run as an indeterminate loader.",
        "when": "Use it to report progress such as uploads, multi-step flows, or budget usage.",
        "related": ["CircularBar", "Skeleton", "Rating"],
        "tips": [
            "Set indeterminate: true when the duration is unknown and no numeric value applies.",
            "Combine showValue with valuePosition to place the percentage beside the bar.",
        ],
        "accessibility": [
            "Include label so the bar is announced with context, not just as a length.",
        ],
        "behavior": [
            "value is clamped against max, so 120 with max 100 renders as full.",
            "striped and animatedStripes add motion cues without changing the value.",
        ],
        "basic": '''const progress = ProgressBar({
  value: 60,
});''',
        "normal": '''const progress = ProgressBar({
  value: 60,
  max: 100,
  height: 8,
  color: "#2563eb",
  backgroundColor: "#e2e8f0",
});''',
        "full": '''const progress = ProgressBar({
  value: 72,
  max: 100,
  width: "100%",
  height: 12,
  color: "#16a34a",
  backgroundColor: "#e5e7eb",
  borderRadius: 6,
  label: "Upload",
  showValue: true,
  valuePosition: "right",
  striped: true,
  animatedStripes: true,
});''',
    },
    "Rating": {
        "summary": "A row of star icons that captures or displays a score up to max. It supports "
                   "half-star selection and an inline numeric readout.",
        "when": "Use it for product reviews, feedback forms, or any quick qualitative score.",
        "related": ["ProgressBar", "Slider", "Chip"],
        "tips": [
            "Set readOnly: true to display an aggregate score that users cannot change.",
            "Use allowHalf: true for finer-grained ratings like 3.5 stars.",
        ],
        "accessibility": [
            "Provide a nearby Text label or showValue so the chosen score is readable, not just stars.",
        ],
        "behavior": [
            "onChange receives the numeric value each time the user picks a rating.",
            "readOnly disables onChange while keeping the current value visible.",
        ],
        "basic": '''const rating = Rating({
  value: 4,
});''',
        "normal": '''const rating = Rating({
  value: 4,
  max: 5,
  size: 24,
  activeColor: "#f59e0b",
  onChange: (value) => console.log(value),
});''',
        "full": '''const rating = Rating({
  value: 3.5,
  max: 5,
  size: 28,
  allowHalf: true,
  gap: 4,
  activeColor: "#f59e0b",
  inactiveColor: "#d1d5db",
  showValue: true,
  valueColor: "#374151",
  valueSize: 16,
  onChange: (value) => console.log("rated", value),
});''',
    },
    "Chip": {
        "summary": "A compact, pill-shaped label for tags, filters, and selections. It can carry "
                   "a leading icon and a delete affordance.",
        "when": "Use it to represent selected filters, categories, or removable tokens.",
        "related": ["Badge", "Avatar", "Button"],
        "tips": [
            "Use variant: \"outlined\" for unselected filters and a filled color once active.",
            "Add onDelete only when the chip represents a removable value.",
        ],
        "accessibility": [
            "The label text is the accessible name, so keep it a single clear word or short phrase.",
        ],
        "behavior": [
            "onPress fires from the chip body; onDelete fires from the trailing close control.",
            "A chip with onPress but no onDelete behaves like a small toggle button.",
        ],
        "basic": '''const tag = Chip({
  label: "Design",
});''',
        "normal": '''const tag = Chip({
  label: "Design",
  icon: "palette",
  onPress: () => console.log("filter by design"),
});''',
        "full": '''const tag = Chip({
  label: "Design",
  icon: "palette",
  variant: "outlined",
  size: "small",
  color: "#eff6ff",
  textColor: "#1d4ed8",
  borderColor: "#bfdbfe",
  borderRadius: 999,
  gap: 6,
  onPress: () => console.log("filter by design"),
  onDelete: () => console.log("removed"),
});''',
    },
    "Badge": {
        "summary": "Wraps a child widget and overlays a small count or status marker at one of "
                   "its corners. Commonly used for notification counts.",
        "when": "Use it to signal unseen items or status on an icon, avatar, or button.",
        "related": ["Avatar", "Icon", "Chip"],
        "tips": [
            "Set max so large counts collapse to \"99+\" style displays.",
            "Use position and offset to place the marker precisely on irregular shapes.",
        ],
        "accessibility": [
            "The badge value is visual only; add a Text or title nearby to convey the count.",
        ],
        "behavior": [
            "showZero: false hides the marker entirely when value is 0.",
            "A borderWidth with a matching borderColor creates a clean cutout against the child.",
        ],
        "basic": '''const badge = Badge({
  value: 5,
  child: Icon({ name: "notifications" }),
});''',
        "normal": '''const inbox = Badge({
  value: 12,
  max: 99,
  bgColor: "#dc2626",
  color: "#ffffff",
  child: Icon({ name: "mail" }),
});''',
        "full": '''const inbox = Badge({
  value: 120,
  max: 99,
  bgColor: "#dc2626",
  color: "#ffffff",
  size: 18,
  position: "top-right",
  offset: 4,
  borderWidth: 2,
  borderColor: "#ffffff",
  showZero: false,
  child: Icon({ name: "mail", size: 28 }),
});''',
    },
    "Divider": {
        "summary": "A thin horizontal or vertical line that separates sections of content. Its "
                   "thickness, color, and spacing are all adjustable.",
        "when": "Use it to break up lists, forms, or toolbars where whitespace alone is not enough.",
        "related": ["ListTile", "Card", "Container"],
        "tips": [
            "Use orientation: \"vertical\" inside Row layouts and horizontal elsewhere.",
            "margin accepts a number or an object with per-side values for fine spacing control.",
        ],
        "accessibility": [
            "Dividers are purely decorative and are hidden from assistive technology.",
        ],
        "behavior": [
            "Horizontal dividers stretch to the available width; vertical ones need a parent height.",
            "thickness sets the line weight and defaults to a hairline.",
        ],
        "basic": '''const divider = Divider({});''',
        "normal": '''const divider = Divider({
  thickness: 1,
  color: "#e5e7eb",
  margin: 16,
});''',
        "full": '''const divider = Divider({
  orientation: "vertical",
  thickness: 2,
  color: "#cbd5e1",
  margin: { top: 8, bottom: 8, left: 12, right: 12 },
});''',
    },
    "Accordion": {
        "summary": "A collapsible panel that hides a title bar with expandable content beneath it. "
                   "It animates open and closed and can report its state.",
        "when": "Use it for FAQs, advanced settings, or any content you want to tuck away by default.",
        "related": ["Card", "ListTile", "Divider"],
        "tips": [
            "Vary variant: \"outlined\", \"contained\", or \"ghost\" to match the surrounding surface.",
            "Set expanded to control the initial state when the panel mounts.",
        ],
        "accessibility": [
            "The title becomes the toggle label, so write it as a clear question or section name.",
        ],
        "behavior": [
            "onToggle receives the new expanded boolean whenever the header is activated.",
            "disabled blocks toggling, and animate: false skips the open/close transition.",
        ],
        "basic": '''const faq = Accordion({
  title: "What is FletBox?",
  children: Text({ text: "A declarative UI framework." }),
});''',
        "normal": '''const faq = Accordion({
  title: "Shipping options",
  expanded: false,
  onToggle: (expanded) => console.log(expanded),
  children: Text({ text: "Free shipping over $50." }),
});''',
        "full": '''const faq = Accordion({
  title: "Payment methods",
  variant: "outlined",
  borderRadius: 12,
  bgColor: "#ffffff",
  expandedColor: "#f8fafc",
  titleColor: "#0f172a",
  titleSize: 16,
  titleWeight: "bold",
  titlePadding: "16px",
  contentPadding: "0 16px 16px",
  iconColor: "#64748b",
  iconSize: 22,
  divider: true,
  animate: true,
  animationDuration: 250,
  onToggle: (expanded) => console.log(expanded),
  children: Text({ text: "We accept cards, PayPal, and bank transfer." }),
});''',
    },
    "Input": {
        "summary": "A text field that handles labels, placeholder text, input types, icons, "
                   "validation, and change events in one widget.",
        "when": "Use it for any free-form text entry such as names, emails, passwords, or search.",
        "related": ["Dropdown", "Switch", "Button"],
        "tips": [
            "Match type to the data (email, password, search) so mobile keyboards adapt.",
            "Set validation and showValidationMessage to get inline feedback without extra code.",
        ],
        "accessibility": [
            "Always give a label or placeholder so the field has an accessible name.",
            "error text is announced alongside the field when validation fails.",
        ],
        "behavior": [
            "onChange fires on every keystroke; onEnter fires when the user presses Enter.",
            "clearable and passwordToggle add trailing controls that manage the value for you.",
        ],
        "basic": '''const name = Input({
  placeholder: "Your name",
});''',
        "normal": '''const email = Input({
  label: "Email",
  type: "email",
  placeholder: "you@example.com",
  onChange: (value) => console.log(value),
});''',
        "full": '''const password = Input({
  label: "Password",
  type: "password",
  placeholder: "Enter a password",
  variant: "outlined",
  size: "medium",
  fullWidth: true,
  borderRadius: 8,
  required: true,
  clearable: true,
  passwordToggle: true,
  iconLeft: "lock",
  validation: "safe",
  maxLength: 32,
  showValidationMessage: true,
  onChange: (value) => console.log(value),
  onValidated: (isValid, message) => console.log(isValid, message),
});''',
    },
}
