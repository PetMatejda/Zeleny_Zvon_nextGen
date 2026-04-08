```markdown
# Design System Document

## 1. Overview & Creative North Star: "The Resonant Sanctuary"

The creative direction for this design system is **"The Resonant Sanctuary."** It is an editorial-inspired, holistic framework designed to transform a standard e-commerce experience into a therapeutic journey. Unlike rigid, grid-locked corporate sites, this system embraces **intentional asymmetry**, breathing room, and a tactile, layered depth that mirrors the experience of a high-end wellness retreat.

The "template" look is avoided through the use of expansive white space and high-contrast typography scales. We treat the digital interface as a curated physical space: elements don't just "sit" on a screen; they rest, overlap, and breathe. This creates a sense of rhythmic calm, reflecting the "Zelený Zvon" (Green Bell) ethos of harmony and resonance.

---

## 2. Colors: Tonal Depth & Natural Atmosphere

The color strategy moves away from clinical whites. We use a base of warm creams and deep forest greens to ground the user in nature.

### The Palette
*   **Primary (`#000000` / `primary_container: #101f0d`):** Used for absolute authority in text and grounding elements.
*   **Secondary (`#765a17` / `secondary_fixed: #ffdf9f`):** Represents the "wood" and "warmth"—used for highlights, active states, and specialized calls to action.
*   **Surface Hierarchy (`surface: #faf9f4`):** A warm, off-white base that feels like artisanal paper rather than a digital screen.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders (`#CCCCCC` etc.) are strictly prohibited for sectioning. Structural boundaries must be defined through:
1.  **Background Color Shifts:** Placing a `surface_container_low` (`#f5f4ef`) section immediately adjacent to a `surface` (`#faf9f4`) background.
2.  **Tonal Transitions:** Using the Spacing Scale (specifically `16` or `20`) to create a "void" of negative space that acts as a natural separator.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers.
*   **Base:** `surface`
*   **In-page Sections:** `surface_container` or `surface_variant`
*   **Floating Cards/Modals:** `surface_container_lowest` (`#ffffff`) to create a subtle "pop" of brightness.
*   **Nesting:** To highlight a product in a list, place a `surface_container_highest` card inside a `surface_container_low` section.

### Glassmorphism & Signature Textures
To achieve a "premium" feel, use **Backdrop Blur (20px-30px)** on floating elements like navigation bars or overlays. Use semi-transparent versions of `surface_container_low` (80% opacity) to allow background colors to bleed through, creating a "frosted glass" effect.
*   **Signature Gradient:** For Hero backgrounds or primary CTAs, use a subtle linear gradient from `primary_container` (#101f0d) to a custom tinted version of `surface_tint` (#52634c) to add "soul" and depth.

---

## 3. Typography: Editorial Authority

The system uses a sophisticated pairing of **Noto Serif** for prestige and **Plus Jakarta Sans** for modern clarity.

*   **Display (notoSerif):** The "Voice." Use `display-lg` (3.5rem) with generous tracking for hero statements. It conveys a sense of timeless wisdom.
*   **Headline (notoSerif):** Used for storytelling sections. `headline-md` (1.75rem) provides a soft but clear hierarchy.
*   **Title (plusJakartaSans):** The "Guide." `title-lg` (1.375rem) is used for product names and course titles, providing a contemporary, professional contrast to the serif headings.
*   **Body (plusJakartaSans):** The "Information." `body-lg` (1rem) is optimized for readability with a line height of 1.6 to ensure a therapeutic, non-cramped reading experience.
*   **Label (plusJakartaSans):** Used for metadata, e.g., "60 min session" or "In stock."

---

## 4. Elevation & Depth: The Layering Principle

We reject the "drop shadow" of the early web. Depth is achieved through **Tonal Layering**.

*   **Ambient Shadows:** When a floating effect is required (e.g., a product quick-buy modal), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(15, 30, 12, 0.06);`. Note the color: we use a tiny percentage of our forest green (`on_primary_fixed`) rather than black to keep the shadow "organic."
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use `outline_variant` at **15% opacity**. It should be felt, not seen.
*   **Roundedness:** All interactive elements must follow the **Roundedness Scale**.
    *   **Buttons/Inputs:** `DEFAULT` (0.5rem)
    *   **Product Cards/Sections:** `xl` (1.5rem)
    *   **Selection Chips:** `full` (9999px)

---

## 5. Components: Stylized Primitives

### Buttons
*   **Primary:** `primary_container` background with `on_primary` text. No border. Soft `DEFAULT` rounding.
*   **Secondary:** `surface_container_high` background. This creates a "recessed" look rather than a traditional outlined button.
*   **Hover State:** Shift background brightness by 5% and increase the Ambient Shadow slightly.

### Cards & Lists
*   **No Dividers:** Forbid the use of line-dividers between list items. Use a `3` (1rem) spacing increment or a alternating `surface_container_low` background.
*   **Asymmetric Cards:** For "Featured Courses," use the `xl` (1.5rem) corner radius but consider a slight horizontal offset in the layout to break the verticality.

### Input Fields
*   **Style:** Minimalist. Background: `surface_container_low`. Border: None. Focus state: A subtle "Ghost Border" appears using `secondary` at 30% opacity.

### Featured Component: "The Essence Chip"
A custom chip component for aroma profiles. Use `full` rounding, `secondary_container` background, and `label-md` typography. These should feel like small, smooth pebbles.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts where text is left-aligned and images are slightly offset to the right.
*   **Do** prioritize vertical whitespace. If a section feels crowded, double the padding (use `20` or `24` from the scale).
*   **Do** use the `notoSerif` for quotes and "philosophical" brand statements to reinforce the therapeutic aspect.

### Don't:
*   **Don't** use 100% black (#000000) for body text; use `on_surface` (#1b1c19) to reduce eye strain.
*   **Don't** use hard, dark shadows. If the shadow looks like a "shadow," it is too heavy. It should look like "ambient light."
*   **Don't** use standard "Boostrap-style" grids. Allow images to break the container edges or bleed into the margins to create an editorial feel.
*   **Don't** use sharp corners. Everything in nature is rounded; the UI should follow suit.