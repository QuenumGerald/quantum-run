# Palette's UX Journal

## 2025-05-18 - Accessible Code Editor Textarea Focus & ARIA
**Learning:** Raw `<textarea>` elements used as custom code editors in dark-mode UIs often lack `aria-label` and visible `:focus-visible` states, making them invisible to screen readers and difficult to navigate with a keyboard.
**Action:** Always add explicit `aria-label`, `aria-hidden="true"` to line number gutters, and clear focus ring styles on focus for custom textareas.

## 2025-05-18 - Avoid Fluorescent Accents & Prefer Elegant Blue Focus Rings
**Learning:** High-saturation yellow/amber or neon green accents can look harsh ("moche") in dark interfaces. Elegant blue (`#3B82F6`) provides superior, non-harsh contrast for focus indicators.
**Action:** Use `#3B82F6` blue focus outlines for focus states instead of yellow or neon colors.
