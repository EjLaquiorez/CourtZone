### CourtZone Pick-Up Dashboard Design System

#### Colors

- **Primary action (`primary.500`)**: `#FF6B35` — main CTA and FAB.
- **Info / your game (`info`)**: `#2563EB`.
- **Status**:
  - `status.open`: `#22C55E` (open spots).
  - `status.filling`: `#EAB308` (filling fast).
  - `status.full`: `#EF4444` (full/closed).
  - `status.yours`: `#2563EB` (your active game).
- **Surfaces**:
  - `surface.light`: `#F3F4F6` (day/light backgrounds).
  - `surface.dark`: `#0F172A` (night/dark backgrounds).
- **Text**:
  - High contrast: light text on `dark-800/900` backgrounds.
  - Muted: `text-primary-300` for secondary metadata.

#### Typography

- **Headlines** (golden-ratio-inspired scale in `tailwind.config.ts`):
  - `text-display-1`, `text-display-2` for hero headings.
  - `text-heading-1/2/3` for section titles and card headers.
- **Fonts**:
  - Display: `font-display` (Orbitron / sport energy).
  - Body: `font-sans` / `font-primary` (Inter).

#### Layout & Components

- **3-zone layout** on `dashboard/page.tsx`:
  - Zone 1: in-page top bar with search and quick “Nearby” action.
  - Zone 2: `LiveMapHero` + `GameListSection` (map first, then actionable list).
  - Zone 3: `PersonalPanel` (upcoming games, invitations, friends, activity, quick re-invite).
  - Global FAB: `CreateGameFab` fixed bottom-right.
- **Smart filters & urgency**:
  - Game list shows spots remaining and urgency text when ≤2 spots.
  - Directions link uses external maps for navigation integration.
  - Quick re-invite uses last game to pre-fill a new create-game flow.

#### Accessibility (WCAG 2.1 AA)

- **Hit targets**:
  - Join buttons and FAB are ≥44px in both dimensions and full-width where primary.
- **Contrast**:
  - Status colors chosen to maintain contrast on dark backgrounds.
  - Text never relies on color alone; status text labels accompany colored pills.
- **Keyboard & focus**:
  - FAB and modal close button have visible focus rings.
  - Create Game bottom sheet is marked as `role="dialog"` and `aria-modal="true"`.
- **Reduced cognitive load**:
  - Each card surfaces a single primary CTA (Join).
  - Side panel chunked into clear sections (My games, Invitations, Friends, Activity, Quick re-invite).

