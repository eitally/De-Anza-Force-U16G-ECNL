# Dynamic QR Code Redirects for Printable Scouting Packet

Enable team members to freely replace or update their Google Drive player profile documents at any time—even after scouting packets are printed—by encoding permanent website redirect URLs in each player's QR code that automatically forward scouts straight to the player's latest document.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during clarification and govern this implementation:

- **Confirmed Decision 1 — Permanent Website Redirect URLs in QR Codes**: Instead of baking raw `drive.google.com/...` file URLs directly into the QR codes on the scouting packet, each player's QR code will encode a permanent, compact URL on the team website (`https://www.deanzaforce2011g.com/?profile=<jerseyNumber>`).
- **Confirmed Decision 2 — Direct Redirect to Latest PDF Document**: When a college coach scans a player's QR code, the website immediately looks up that player's current profile document URL from the live roster store and redirects the browser straight to their latest Google Drive PDF, Google Slide, or Canva profile (falling back to the player's online profile modal only if no document URL is on file).

---

## 1. Overview & Core Concept

- **What It Does**: Decouples the printed QR codes on the bifold College Scouting Packet from static Google Drive file IDs by routing QR scans through a dynamic player profile redirect handler on the team website.
- **Target Audience / Persona**:
  - **College Scouts & Recruiting Coordinators**: Scan a player's QR code on the printed sideline sheet and land directly on the athlete's most up-to-date profile PDF without extra clicks.
  - **Players, Parents & Team Admins**: Can upload a brand-new PDF to Google Drive and update the link on the site (or replace the file version in Google Drive) without ever invalidating already-printed scouting packets.
- **Key Value**:
  1. **Future-Proof Printed Packets**: Printed handouts and previously emailed PDF packets never go stale when a player swaps their Google Drive link.
  2. **Cleaner, Faster-Scanning QR Codes**: Short, uniform URLs (`https://www.deanzaforce2011g.com/?profile=22`) produce lower-density QR matrices that scan faster and more reliably from a distance than long Google Drive sharing URLs.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Generating & Printing the Scouting Packet**:
     - When viewing the Printable Scouting Packet, every player's card displays a crisp QR code encoding their permanent redirect link (`https://www.deanzaforce2011g.com/?profile=<jerseyNumber>`).
  2. **Scanning a Player QR Code (Direct Document Redirect)**:
     - A college coach scans a player's QR code with their phone camera.
     - The browser opens `?profile=<jerseyNumber>`, displays a clean, minimal De Anza Force redirect screen for a fraction of a second while resolving the latest roster data, and immediately redirects (`window.location.replace`) to the player's current Google Drive PDF / Slides / Canva URL.
     - A direct manual **"Open Player Profile Document"** button is also rendered on the redirect screen so in-app QR scanners that restrict automatic redirects still allow one-tap access.
  3. **Fallback for Players Without a Document**:
     - If a player does not yet have a document link on file, scanning their QR code smoothly opens the team roster page with that player's interactive profile modal open (`?player=<jerseyNumber>#roster`).
  4. **Updating a Document Link**:
     - Admins or team managers can update any player's `Player Profile PDF Link` via the Admin Player Editor or Roster CSV/Sheet Import, and all existing QR codes immediately route to the new link.

- **Visual Identity & Theme**:
  - **Aesthetic Direction**: Clean, athletic collegiate-scouting utility matching the De Anza Force club identity.
  - **Color Palette & Mood**: Deep navy slate canvas (`#0b101d`), club royal blue (`#1D4ED8`), and crimson accents (`#DC2626`) with high-contrast white typography.
  - **Typography & Hierarchy**: Condensed athletic display headings paired with legible sans-serif body copy and tabular numerals for jersey numbers.
  - **Interactive Feedback & Motion**: Instantaneous redirect execution on mount with a clean loading/forwarding card so the full home page never flashes before the document opens.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Query-Based (`/?profile=<jerseyNumber>`) + Path-Based (`/profile/<jerseyNumber>`) Redirect Support**
  - *Chosen Approach*: Use `https://www.deanzaforce2011g.com/?profile=<jerseyNumber>` as the canonical QR code URL while also supporting `/profile/<jerseyNumber>` on the server.
  - *Why*: Query parameters (`/?profile=22`) work universally across both static CDN/SPA hosting and full-stack Node.js hosting without requiring custom CDN rewrite rules, while also keeping the URL short enough for an ultra-clean QR code.
  - *Alternatives Considered*: Server-only `/profile/22` redirects were considered as the sole mechanism, but if the production domain `deanzaforce2011g.com` serves the SPA root directly, a root query parameter guarantees 100% compatibility everywhere.

- **Decision 2: Live Lookup Before Redirect**
  - *Chosen Approach*: When `/?profile=<jerseyNumber>` is opened, the app checks the latest server/cloud player record first (with a fast timeout fallback to the bundled verified roster) before redirecting.
  - *Why*: Ensures that if an admin updates a player's Google Drive link in the Admin Editor 5 minutes before a match, any coach scanning the printed sheet on the sideline gets the newly saved link rather than a cached default.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   Printed / PDF College Scouting Pack                    │
│     Player Card QR Code ──► https://www.deanzaforce2011g.com/?profile=22 │
└───────────────────────────────────────────────────┬──────────────────────┘
                                                    │
                                     Scout Scans QR │ Code
                                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                 Profile Redirect Resolver (Client + Server)              │
│  1. Detects ?profile=<key> (or /profile/<key>) BEFORE rendering Full SPA │
│  2. Fetches latest Player list from Server Store / Cloud / Verified CSV  │
│  3. Matches player by Jersey Number (#0–#49) or Player ID                │
└─────────────────────────┬─────────────────────────────────────┬──────────┘
                          │                                     │
         Valid Document   │ URL Exists                          │ No Document URL Yet
         (Drive / Canva)  ▼                                     ▼
┌─────────────────────────────────────────┐   ┌────────────────────────────┐
│  Immediate Browser Redirect             │   │  Fallback to Online Modal  │
│  window.location.replace(validDocUrl)   │   │  Opens Player Profile      │
│  + Instant Fallback Link Button         │   │  Modal on Team Website     │
└─────────────────────────────────────────┘   └────────────────────────────┘
```

- **Data Model & State**:
  - Uses existing `Player` fields (`jerseyNumber`, `id`, `name`, `profilePdfUrl`, `profileDocUrl`) resolved via `getValidDocumentUrl(player)`.
  - No schema migration is required; existing Google Drive, Google Slides, and Canva URLs work out of the box.

- **Interactive Component & State Mapping**:
  - **Printable Scouting Card QR Generator**: Encodes `https://www.deanzaforce2011g.com/?profile=${encodeURIComponent(String(player.jerseyNumber ?? player.id))}` for every player's QR code image.
  - **Dedicated Profile Redirect Gate**: When the app detects `?profile=` in the URL query string, it renders a lightweight, dedicated redirect view instead of the heavy home page, resolves the latest player record from `/api/team-data` / cloud state, and triggers `window.location.replace(docUrl)`.
  - **Express Server `/profile/:key` Route**: Also supports direct server-side HTTP 302 redirects if `/profile/<jerseyNumber>` is visited directly.
