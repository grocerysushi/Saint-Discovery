// Utility overrides for `<Button variant={null} size={null}>` when a site class
// (for example `.option-button`, `.quiz-back`, `.text-link` or `.room-tabs button`)
// already provides the visual style. They undo the shadcn base styles that the site
// class does not set, so the button keeps the original look while gaining the shared
// Button primitive. The global `:focus-visible` outline remains the focus indicator.
export const PLAIN_BUTTON =
  "h-auto rounded-none border-0 text-[length:inherit] font-normal whitespace-normal select-auto focus-visible:ring-0 active:not-aria-[haspopup]:translate-y-0";

// Utility overrides for `<Card>` when a site class (`.result-panel`, `.email-flow-card`)
// already provides padding, background, border and radius. They keep normal block flow,
// inherited text size/colour and no extra ring, so the card looks as it did before.
export const PLAIN_CARD = "block gap-0 overflow-visible ring-0 text-[length:inherit] text-inherit";
