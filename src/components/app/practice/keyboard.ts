/**
 * Shared rules for page-level keyboard shortcuts in practice and mock exams.
 * Shortcuts never fire while the learner is typing, while a modal dialog is open, or with modifier keys.
 */

const NON_TEXT_INPUTS = new Set(["radio", "checkbox", "button", "submit", "reset", "image"]);

/** True when the event target accepts text or value entry (text-like inputs, sliders, textareas, selects, contenteditable). */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(target.type);
  return false;
}

/** True when the target is a native radio button (arrow keys belong to the radio group there). */
export function isRadioTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && target.type === "radio";
}

/** True when the target is a control whose own Enter/Space behavior must not be overridden. */
export function isActivatableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a[href], summary, [role='button'], [role='link'], [role='tab']"));
}

/** Shortcuts are ignored for this event. */
export function shouldIgnoreShortcut(e: KeyboardEvent): boolean {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return true;
  if (isEditableTarget(e.target)) return true;
  if (e.target instanceof Element && e.target.closest("dialog, [role='dialog'], [role='alertdialog']")) return true;
  if (document.querySelector("dialog[open]")) return true;
  return false;
}

/** Maps "1".."4" to a choice index 0..3, otherwise null. */
export function choiceFromKey(key: string): number | null {
  if (key.length !== 1) return null;
  const n = key.charCodeAt(0) - 49; // "1" is 49
  return n >= 0 && n <= 3 ? n : null;
}
