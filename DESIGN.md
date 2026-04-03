# Design System Specification: Modern Organic Agro-Tech

## 1. Overview & Creative North Star: "The Digital Agronomist"
This design system rejects the sterile, "dashboard-in-a-box" aesthetic of typical SaaS products. Instead, it adopts the North Star of **"The Digital Agronomist"**—a high-end, editorial-inspired experience that treats agricultural data with the same reverence as a luxury architectural journal.

By combining the tactile warmth of `Background Paper` with the precision of `JetBrains Mono`, the system creates a tension between the organic and the technical. We break the grid through **intentional asymmetry**: large-scale typography headers are offset against compact data modules, and floating "glass" cards overlap photography to create a sense of physical depth. This is not a flat interface; it is a layered workspace where tech serves the earth.

---

## 2. Color & Surface Architecture
We do not use lines to define space. We use light and tone.

### The "No-Line" Rule
Explicitly prohibited: 1px solid borders (`#000` or `#CCC`) for sectioning. Layout boundaries must be defined solely through:
1.  **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.
2.  **Negative Space:** Utilizing the Spacing Scale (e.g., `8.5rem` / `24`) to create breathing room that acts as a natural separator.

### Surface Hierarchy & Nesting
Treat the mobile screen as a series of stacked, high-end paper stocks:
- **Base Layer:** `surface` (#fafaf5) – The foundation.
- **Structural Zones:** `surface-container-low` (#f4f4ef) – Use for large background sections or grouped content areas.
- **Interactive Elements:** `surface-container-highest` (#e3e3de) – Use for tappable cards or elevated inputs.

### The "Glass & Gradient" Rule
To achieve a "Signature" look, floating action bars or critical modal overlays must use **Glassmorphism**:
- **Fill:** `surface_variant` (#e3e3de) at 70% opacity.
- **Effect:** `backdrop-blur: 24px`.
- **Signature Gradient:** For primary CTAs, transition from `primary` (#33450d) to `primary_container` (#4a5d23) at a 135-degree angle to provide a "velvet" finish.

---

## 3. Typography: Editorial Authority
The type system balances the humanistic clarity of **Inter** with the industrial precision of **JetBrains Mono**.

| Level | Token | Font | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Inter | 3.5rem | Bold, -2% tracking. For hero metrics (e.g., Soil PH). |
| **Headline**| `headline-md` | Inter | 1.75rem | Medium. For section headers. |
| **Title**   | `title-sm` | Inter | 1.0rem | Semi-bold. For card titles. |
| **Technical**| `body-md` | JetBrains Mono | 0.875rem | For GPS coords, sensor IDs, and timestamps. |
| **Micro**   | `label-sm` | Inter | 0.6875rem | All-caps, +5% tracking. High-contrast (Ink Black). |

**Hierarchy Note:** Use `secondary` (#994700) sparingly for `label-sm` to highlight "Warning" or "Active" technical states, creating a "field-tag" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "digital." We use **Ambient Shadows** and **Tonal Stacking**.

*   **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f4f4ef) background. This creates a soft, natural lift that mimics heavy paper.
*   **Ambient Shadows:** For floating elements (like a FAB), use: `box-shadow: 0 12px 40px rgba(26, 28, 25, 0.06);`. The shadow color is a tint of `on_surface`, never pure black.
*   **The Ghost Border:** If high-contrast accessibility is required, use a `1px` stroke of `outline_variant` at **15% opacity**. This provides a "suggestion" of a boundary without breaking the organic flow.

---

## 5. Signature Components

### Buttons & Interaction
*   **Primary Action:** `xl` (3rem) rounded corners. Filled with `primary` (#33450d). Text is `on_primary` (#ffffff) using `label-md`.
*   **Technical Toggle:** Use `JetBrains Mono` for labels inside selection chips.
*   **The "Agro-Chip":** Background: `secondary_container` (#fd852f), Text: `on_secondary_container` (#632c00). Used for urgent environmental alerts (e.g., "Frost Warning").

### Inputs & Fields
*   **Modern Field:** No bottom line. Instead, use a `surface_container_high` background with `xl` (3rem) rounded corners.
*   **Focus State:** Shift background to `surface_bright` and apply a `Ghost Border` using the `primary` token at 20% opacity.

### Cards & Data Lists
*   **The Card Rule:** Forbid divider lines. Separate list items using `spacing-4` (1.4rem) and subtle background alternates (Tonal Striping).
*   **Data Visualization:** Use `primary` (#33450d) for positive growth trends and `secondary` (#994700) for resource depletion.
*   **Sensor Modules:** Group `JetBrains Mono` technical data in small `surface_container_highest` pods nested within a larger card.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `JetBrains Mono` for any number that is being "measured" (e.g., liters, degrees, hectares).
*   **Do** use `32px` (`xl`) corner radii for main containers and `24px` (`lg`) for nested elements.
*   **Do** embrace asymmetric white space. Let the "Paper" background breathe to create a premium, unhurried feel.

### Don't
*   **Don't** use 100% opaque black. Always use `Ink Black` (#141414) for text to maintain a softer, high-end ink-on-paper look.
*   **Don't** use standard "Material Design" shadows. If it looks like a default Android app, add more blur and reduce the opacity.
*   **Don't** use icons as the primary way to convey meaning. Pair them with `label-sm` text to maintain an editorial, "captioned" style.