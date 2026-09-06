# BookHive UI Consistency Guide

This guide defines the visual rules BookHive should follow across public pages, auth pages, reader flows, author pages, admin pages, and super admin pages. Use it before adding a new screen, polishing an existing screen, or reviewing a pull request.

## Design Direction

BookHive should feel like a premium digital library: calm, academic, editorial, trustworthy, and easy to scan. Public pages may use richer imagery and serif headings. Admin and author work areas should stay quieter, denser, and task-focused.

The product should not feel like separate apps stitched together. Cards, typography, spacing, buttons, form controls, empty states, and icons should share the same visual language unless the role context clearly requires a different density.

## Source Of Truth

Keep shared visual decisions in `bookhive-frontend/src/styles.scss` where possible.

Current public tokens:

```scss
--public-page-bg: #fafafa;
--public-paper: #ffffff;
--public-paper-warm: #fdfbf7;
--public-border: #e9e3d6;
--public-border-strong: #d8ccb3;
--public-ink: #1c1917;
--public-muted: #78716c;
--public-gold: #854d0e;
--public-gold-hover: #713f12;
--public-gold-soft: #fdf8e6;
--public-radius-card: 12px;
--public-radius-control: 8px;
--public-shadow-card: 0 4px 18px rgba(28, 25, 23, 0.05);
--public-shadow-card-hover: 0 12px 28px rgba(28, 25, 23, 0.09);
--public-section-x: 24px;
--public-section-y: clamp(52px, 6vw, 72px);
--public-container: 1280px;
```

When improving consistency, prefer using these tokens instead of adding new one-off values.

## Typography

Use `Inter` for UI, navigation, filters, forms, metadata, dashboards, and actions. Use `Newsreader` for editorial headings, book titles, public hero headings, and public section titles.

Recommended scale:

| Use Case | Font | Size |
| --- | --- | --- |
| Public hero heading | `var(--font-serif)` | responsive `clamp()` |
| Public page H1 | `var(--font-serif)` | 32-44px |
| Public section title | `var(--font-serif)` | 26-34px |
| Card title | `var(--font-serif)` | 18-24px |
| Dashboard page title | `var(--font-sans)` | 28-32px |
| Body text | `var(--font-sans)` | 14-16px |
| Metadata / labels | `var(--font-sans)` | 11-13px |
| Buttons | `var(--font-sans)` | 13-15px |

Rules:

- Do not scale font size directly with viewport width only. Use `clamp()`.
- Keep letter spacing at `0` for normal text. Use small positive letter spacing only for uppercase metadata.
- Public headings should be editorial but not oversized on MacBook and laptop screens.
- Avoid one-word-per-line headings except on very narrow screens.
- Keep body copy widths readable: roughly 460-620px depending on layout.

## Colors

Primary public palette:

- Ink: `var(--public-ink)`
- Muted text: `var(--public-muted)`
- Gold action: `var(--public-gold)`
- Gold hover: `var(--public-gold-hover)`
- Warm page section: `var(--public-paper-warm)`
- Card background: `var(--public-paper)`
- Card border: `var(--public-border)`

Rules:

- Avoid introducing random browns, blues, purples, or grays when an existing token fits.
- Public UI should remain warm and academic, but not beige-heavy.
- Admin and author areas can use cooler neutral backgrounds, but action colors should still align with BookHive gold.
- Ensure text contrast remains readable on image backgrounds and badges.

## Spacing

Use an 8px-based spacing rhythm:

- Small gaps: 8px, 12px
- Component gaps: 16px, 20px, 24px
- Section gaps: 40px, 52px, 64px, 72px

Rules:

- Page top spacing under the navbar should feel consistent across Home, Explore, Community, and About.
- Avoid large empty vertical gaps inside cards.
- CTA buttons should sit close enough to their description to feel connected.
- Bottom feature cards on heroes should be visible on typical laptop screens.
- Filters/sidebar panels should align with the main page heading on desktop.

## Cards

Public cards should default to:

```scss
background: var(--public-paper);
border: 1px solid var(--public-border);
border-radius: var(--public-radius-card);
box-shadow: var(--public-shadow-card);
```

Hover:

```scss
transform: translateY(-3px) or translateY(-4px);
box-shadow: var(--public-shadow-card-hover);
border-color: var(--public-border-strong);
```

Rules:

- Do not use heavily rounded cards unless the card is a pill, modal, or brand-specific surface.
- Do not nest cards inside cards.
- Keep repeated cards at equal heights only when it improves scanning.
- List view cards should be horizontal on desktop and stacked on mobile.
- Grid cards should have stable cover ratios and stable action button areas.

## Buttons

Use consistent button heights:

| Button Type | Height |
| --- | --- |
| Small toolbar button | 32-36px |
| Standard action | 40-44px |
| Primary CTA | 44-48px |
| Auth submit / hero CTA | 46-52px |

Primary:

```scss
background: var(--public-gold);
border-color: var(--public-gold);
color: #ffffff;
border-radius: var(--public-radius-control);
```

Secondary:

```scss
background: #ffffff;
border: 1px solid var(--public-border);
color: var(--public-ink);
border-radius: var(--public-radius-control);
```

Rules:

- Button text and icon should be vertically centered.
- Icons should not resize the button.
- Avoid tiny text-only buttons for primary user actions.
- Avoid cramped side-by-side actions. Stack them at narrow widths.
- Use the same hover behavior for the same button type.

## Icons

Use Lucide icons or inline SVGs. Avoid raw emojis and raw glyphs such as `★`, `‹`, `›`, `⌄`, `▣`, `▦`, `⤴`, and `ⓘ`.

Rules:

- Do not depend on icon font names rendering correctly.
- Icons inside buttons should usually be 15-18px.
- Icons in cards should usually be 18-24px.
- Decorative icons must use `aria-hidden="true"`.
- Do not use visible text to describe icons when the icon itself can communicate a familiar action.

## Images And Book Covers

Rules:

- Public pages should use real or meaningful visual assets, not empty decorative blocks.
- Book covers should have stable aspect ratios.
- Cover placeholders should still look like book covers.
- Badges such as `Published` should be positioned as badges, not normal text.
- Keep image object-position intentional, especially in Home hero and Explore cards.

Explore card rules:

- Grid view: card cover on top, compact metadata, actions at bottom.
- List view desktop: horizontal row card with cover on the left and details/actions on the right.
- List view mobile: stacked card.
- Avoid very tall list cards unless the cover needs inspection.

## Forms And Filters

Rules:

- Field height should stay within 38-54px depending on context.
- Labels should use consistent uppercase metadata styling.
- Select dropdown arrows should be CSS/SVG, not raw glyphs.
- Checkboxes, sliders, and segmented controls should match the same radius and gold active state.
- Error states should use consistent red tone, icon treatment, and spacing.
- Filter panels should use the same card radius, border, shadow, and page alignment as content cards.

## Layouts By Role

### Reader / Public

Pages: Home, Explore, Community, About, Book Preview, Book Reader.

Priorities:

- Editorial visual quality.
- Clear reading and discovery paths.
- Responsive polish across MacBook, tablet, and mobile.
- Consistent public card language.
- No hidden raw emojis or icon-font names.

Checklist:

- Navbar does not overlap content.
- Hero content fits laptop screens.
- Public cards use the same radius, border, and shadow.
- Grid/list views are visually distinct and useful.
- CTA hierarchy is clear.

### Author

Pages: Dashboard, Books, Analytics, Requests, Profile.

Priorities:

- Productive, calm workspace.
- Honest metrics only.
- Clear upload/submission flows.
- Consistent tables, cards, empty states, and form controls.

Checklist:

- Dashboard metrics do not show fake values.
- Tables remain readable on laptop and mobile.
- Empty states clearly explain what is not available yet.
- Upload actions look primary and easy to find.
- Pagination and toolbar controls use consistent icon/button treatment.

### Admin

Pages: Dashboard, Authors, Readers, Books, Categories, Reports, Support.

Priorities:

- Dense but readable operational UI.
- Strong hierarchy between status, actions, and review details.
- Consistent admin cards and tables.
- Role-based navigation clarity.

Checklist:

- Admin pages use a restrained work-focused palette.
- Status badges are consistent.
- Tables scroll horizontally only when necessary.
- Actions are discoverable and not crowded.
- Admin-only and super-admin-only paths are visually and functionally clear.

### Super Admin

Pages: Admin management and privileged admin areas.

Priorities:

- Clear separation from normal admin access.
- High-confidence destructive or privileged actions.
- Strong empty/loading/error states.

Checklist:

- Privileged pages have clear page titles and descriptions.
- Dangerous actions require visual distinction and confirmation.
- Access-denied redirects do not feel broken.
- Admin management cards/tables match admin design system.

## Responsive Breakpoints

Use these as audit targets:

| Viewport | Purpose |
| --- | --- |
| 1600px+ | Spacious large desktop |
| 1440x900 | MacBook/laptop primary audit |
| 1280x800 | Smaller laptop |
| 1024px | Tablet landscape |
| 768px | Tablet/mobile transition |
| 390px | Mobile primary audit |

Rules:

- No horizontal page overflow.
- Text must not overlap adjacent content.
- Buttons must not shrink below usable touch/click size.
- Cards should not become overly tall because of one fixed image size.
- Sidebars should become stacked or drawer-style when space is limited.

## Accessibility And Interaction

Rules:

- Every interactive icon button needs an accessible label.
- Decorative SVGs should use `aria-hidden="true"`.
- Maintain visible focus states.
- Search inputs need clear labels/placeholders.
- Do not rely on color alone for status.
- Loading, empty, and error states should be understandable without visual context.

## Pull Request Review Checklist

Before merging UI work:

- The page uses existing tokens before adding new colors/shadows/radii.
- Public cards match the public card system.
- Admin/author cards match the operational card system.
- Buttons follow the standard height, radius, and hover behavior.
- No raw emoji/glyph icons are introduced.
- No icon font names are visible.
- Text fits at 1440, 1280, 1024, and 390 widths.
- No horizontal overflow in `document.documentElement.scrollWidth`.
- Empty/loading/error states are styled.
- `npm run build` passes.
- Any build warnings are understood and either fixed or documented.

## Current Follow-Up Items

These are the next consistency improvements to consider:

- Extract duplicated auth page styles into shared auth partials and resolve the `register.scss` budget warning.
- Continue replacing repeated hardcoded colors with the public tokens where safe.
- Add a shared public section header pattern for Home, Explore, Community, and About.
- Add a shared card utility or mixin after the visual language stabilizes.
- Run screenshot QA for public, author, admin, and super admin paths at the audit breakpoints.
