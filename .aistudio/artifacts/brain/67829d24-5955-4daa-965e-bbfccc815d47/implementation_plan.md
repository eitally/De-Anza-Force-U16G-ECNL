# Scouting Packet Layout & Recruiting Contact Updates

This plan updates the Printable College Scouting Packet layout and print orientation, increases readability on player cards, updates recruiting contact messaging to feature Head Coach Paul Bravo, and removes Paul Holocher from the Coaching & Staff roster.

---

## 1. Printable Scouting Packet (`src/components/PrintScoutingPack.tsx`)

### A. Move Coach Information to the Front/Title Cover & Full-Page Notes
- **Front Cover (Outside Right Panel)**:
  - Place the coach information cards (**Paul Bravo — Head Coach • ECNL Dir** and **Yuta Tanaka — Strength & Agility Coach**) directly beneath the `2026` year heading and above the team website QR code footer.
  - Adjust spacing and padding on the Front Cover so the crest, titles (`DE ANZA FORCE`, `U16G ECNL - 2010/2011`, `SCOUTING ROSTER`, `2026`), coach contact cards, and QR code fit cleanly within the single bifold panel without overflowing.
- **Back Cover / Notes Page (Outside Left Panel)**:
  - Remove the top 3-column row (the small Team Profile card and the two Coach cards).
  - Expand the ruled **NOTES** section to span the full height of the Outside Left Panel (~32 ruled lines) so college scouts have a full dedicated page for match notes.

### B. Remove Player Emails & Increase Card Font Sizes
- In `renderPlayerCard(player)`:
  - Remove the `mailto:` email address link at the bottom of each player card while preserving the bottom cyan accent line (`bg-[#00ADEF]`).
  - Increase typography sizes across the bottom info block for better readability both on screen and in print:
    - **Player Name**: Increase from `text-[11px] print:text-[9.5px]` to `text-xs sm:text-[13px] print:text-[11px]`.
    - **Position**: Increase from `text-[8.5px] print:text-[7.5px]` to `text-[10px] sm:text-[10.5px] print:text-[9px]`.
    - **Height • GPA • Grad Year**: Increase from `text-[7.5px] print:text-[7px]` to `text-[9.5px] sm:text-[10px] print:text-[8.5px]`.

### C. Fix Duplex Print Orientation on Inner Player Cards Page
- In standard landscape duplex printing ("Flip on Long Edge"), the inside spread prints upside down relative to the outside folded cover unless rotated 180°.
- Add `print:rotate-180` to the **Page 1 (Inside Bifold Spread)** container in `PrintScoutingPack.tsx`:
  - On screen in the modal preview, Page 1 remains right-side-up for easy reading.
  - When printed (`@media print`), Page 1 automatically rotates 180° so that when folded in half along the center crease, the inner player cards are right-side-up relative to the front cover.

---

## 2. Player Profile Modal Recruiting Footer (`src/components/PlayerModal.tsx`)

- Update the coach contact lookup in `PlayerModal.tsx` to resolve to Head Coach **Paul Bravo** (`coaches.find(c => c.name.toLowerCase().includes('bravo')) || coaches[0]`).
- Replace the footer label:
  - **Before**: `College Recruiting Liaison: {recruitingCoach?.name}` + `Email Liaison` button.
  - **After**: `For recruiting, contact head coach Paul Bravo` + `Email Coach Bravo` button linking to `mailto:paulbravo9@gmail.com` with the pre-filled player inquiry subject line.

---

## 3. Remove Paul Holocher & Update Recruitment Hub (`src/data/defaultData.ts`, `src/App.tsx`, `src/components/CoachingStaff.tsx`, `src/components/RecruitmentHub.tsx`)

- **Default Data & State Hydration (`src/data/defaultData.ts`, `src/App.tsx`)**:
  - Remove Paul Holocher (`id: "c3"`) from `INITIAL_COACHES` in `src/data/defaultData.ts`.
  - Filter out any cached coach entry matching `"holocher"` when loading `coaches` from `localStorage` or Firestore `onSnapshot` in `src/App.tsx` (and persist the cleaned list back to Firestore/localStorage if present) so his card never reappears from cached database state.
- **Coaching & Staff Grid (`src/components/CoachingStaff.tsx`)**:
  - Update the desktop grid layout from 4 columns to 3 columns (`lg:grid-cols-3`) so the 3 remaining staff cards (**Paul Bravo**, **Yuta Tanaka**, and **Rhoda Longhenry**) display in a balanced full-width row.
- **College Recruitment Hub (`src/components/RecruitmentHub.tsx`)**:
  - Update the contact card to feature **Head Coach Paul Bravo** (selecting `coaches.find(c => c.name.toLowerCase().includes('bravo')) || coaches[0]`) with header `Head Coach & Recruiting Contact` instead of `College Liaison Contact`.

---

## Verification Plan
- Run `lint_applet` and `compile_applet` to verify zero TypeScript or build errors.
- Verify the Scouting Packet modal shows Coach cards beneath `2026` on the Front Cover, full-page ruled lines on the Notes panel, larger font sizes with no email addresses on player cards, and `print:rotate-180` on the inner spread.
- Verify the Player Profile modal footer displays `"For recruiting, contact head coach Paul Bravo"` and that Paul Holocher is removed from the Coaching & Staff section.
