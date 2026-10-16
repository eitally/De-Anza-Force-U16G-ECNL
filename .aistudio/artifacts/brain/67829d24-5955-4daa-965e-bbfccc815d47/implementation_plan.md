# Public Player Profile Security & Scouting Pack UI Cleanup

This update locks down all roster modification controls inside the public Player Profile modal so unauthenticated visitors cannot delete, edit, or alter player profiles, and simplifies the Printable College Scouting Pack modal header by removing the page switcher buttons so all pages always display together.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during clarification and govern this update:

- **Confirmed Decision 1 — Admin-Only Controls in Public Player Profile Modal**: Hide all admin mutation controls (`Delete Player`, `Change Photo`, `Edit Profile`, and the `Scouting Profile: Included/Excluded` toggle) on the public Player Profile modal unless the user is authenticated as an admin.
- **Confirmed Decision 2 — Scouting Pack Default Display**: Remove the `"All Pages"`, `"Page 1 (Inside Spread)"`, and `"Page 2 (Outside Cover)"` filter buttons from the Scouting Pack header bar and always render all pages together by default.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Ensures public visitors and college scouts viewing a player's profile modal see a clean, read-only showcase (bio, metrics, game film, academics, and recruiting liaison contact) without any administrative edit or delete buttons.
  2. Authenticated admins retain full access to edit, photo upload, scouting pack inclusion toggles, and player deletion.
  3. Streamlines the Printable College Scouting Pack modal by removing the page-view toggle buttons and always rendering the complete multi-page scouting brochure.
- **Target Audience / Persona**: College soccer scouts, players, parents, and team administrators.
- **Key Value**: Prevents accidental or unauthorized roster deletions/edits on the public site and provides a cleaner, print-ready Scouting Pack experience.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  - **Public Visitor / College Scout Flow (Player Modal)**: Clicking any player card opens the Player Profile modal in read-only mode. The photo upload button (`Change Photo`) and footer admin actions (`Scouting Profile` checkbox, `Delete Player` button, and `Edit Profile` button) are completely hidden. Only the Recruiting Liaison contact button and public profile tabs are shown.
  - **Authenticated Admin Flow (Player Modal)**: When an admin has authenticated in the current session, the Player Profile modal displays the administrative actions (`Change Photo`, `Scouting Profile` toggle, `Edit Profile`, and `Delete Player`).
  - **Scouting Pack Flow**: Clicking `Scouting Pack (Print)` opens the 2-page landscape brochure with both the Inside Spread (Page 1 player grid) and Outside Cover (Page 2 program cover & coaching staff) displayed together, ready for immediate printing or PDF export without page-filter clutter in the top bar.
- **Visual Identity & Theme**:
  - Preserves the existing De Anza Force athletic dark/light visual identity (`#00ADEF` cyan accents, deep navy `#080c14` surfaces, and condensed display typography).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Gate Player Modal Mutation Props & UI by Admin Authentication State**
  - *Chosen Approach*: Pass `isAdminMode={isAuthenticated && isAdminMode}` (or gate the mutation callbacks `onDeletePlayer`, `onEditPlayer`, `onUpdatePlayerPhoto`, and `onTogglePlayerScouting` by `isAuthenticated`) from the root application state AND enforce `isAdminMode` checks inside the Player Modal component before rendering any mutation controls.
  - *Why*: Defense-in-depth ensures that neither the UI buttons nor the underlying callbacks are exposed to unauthenticated public visitors, even if a visitor opens a deep-linked player URL (`?player=p1`).
- **Decision 2: Always Render All Scouting Pack Pages**
  - *Chosen Approach*: Remove the segmented page switcher buttons (`All Pages`, `Page 1 (Inside Spread)`, `Page 2 (Outside Cover)`) from the Scouting Pack top toolbar and lock the view state to always render the full multi-page layout.
  - *Why*: Reduces toolbar clutter and ensures college scouts immediately see the complete bifold brochure and print all pages together.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Root Application State                           │
│   • isAuthenticated (sessionStorage 'daf_team_editor_auth')             │
│   • isAdminMode (URL param / Admin session state)                       │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    ▼                                 ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│          Player Profile Modal         │ │    Printable Scouting Pack    │
│                                       │ │                               │
│ • Public View (Default):              │ │ • Top Control Bar:            │
│   - Read-only Bio, Stats, Film, NCAA  │ │   - Brochure Title Customizer │
│   - Email Recruiting Liaison CTA      │ │   - Print / Save as PDF CTA   │
│   - NO Delete / Edit / Photo / Toggle │ │   - (Page Switcher Removed)   │
│                                       │ │                               │
│ • Authenticated Admin View:           │ │ • Document Body:              │
│   - Change Photo Upload               │ │   - Always renders Page 1     │
│   - Scouting Pack Inclusion Toggle    │ │     (Inside Spread) + Page 2  │
│   - Edit Profile & Delete Player      │ │     (Outside Cover)           │
└───────────────────────────────────────┘ └───────────────────────────────┘
```

### Interactive Component & State Mapping

1. **Root Application -> Player Modal Prop Gating**:
   - Replace the hardcoded `isAdminMode={true}` and unconditional mutation handlers passed to `<PlayerModal />` with `isAuthenticated`-gated props (`isAdminMode={isAuthenticated}` and only passing `onEditPlayer`, `onDeletePlayer`, `onUpdatePlayerPhoto`, and `onTogglePlayerScouting` when `isAuthenticated` is `true`).
2. **Player Modal Internal Guard**:
   - Inside `PlayerModal`, require `isAdminMode` to be `true` before rendering the `Change Photo` upload overlay, `Scouting Profile` inclusion checkbox, `Delete Player` button (and its confirmation dialog), and `Edit Profile` button.
3. **Printable Scouting Pack Toolbar & Page Rendering**:
   - Remove the `All Pages`, `Page 1 (Inside Spread)`, and `Page 2 (Outside Cover)` filter button group from the top control bar in `PrintScoutingPack` while keeping the `Roster Title` inline editor and `Print / Save as PDF` button intact.
   - Always render both Page 1 and Page 2 in the scrollable preview and print output.
