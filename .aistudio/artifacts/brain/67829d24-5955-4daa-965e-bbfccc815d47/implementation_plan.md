# Player Roster Sync & ECNL GU16 League Automation Plan

This plan upgrades the De Anza Force U16G ECNL portal with a single-source-of-truth player synchronization system (persistent Google Sheet live diff sync + inline Admin spreadsheet grid editor) and an automated ECNL Northern California GU16 weekly match score and 12-team league standings engine with a review preview.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed from your clarifying answers and govern this implementation:

- **Confirmed Decision 1 (ECNL GU16 Weekly Automation & Review Preview)**: Automatically check for weekly ECNL Northern California GU16 match scores and league table updates (when an admin opens the portal and the last check is >7 days old) and provide a **1-Click "Sync ECNL Scores & Table"** button with a visual review preview before saving to Firestore.
- **Confirmed Decision 2 (Player Details Sync Workflows)**:
  1. **Saved Google Sheet URL with 1-Click Diff Sync & Duplicate-Column Fix**: Persist the team's Google Sheet URL in `TeamInfo`, map `"Contact Info for the Flyer"` to `contactEmail`, give precedence to rightmost updated `Height`, `Weight`, and `GPA` columns over earlier blank/outdated columns, and show a field-by-field diff preview before applying.
  2. **Inline Spreadsheet Grid Editor in Admin**: Add an Excel-style bulk editing table inside the Admin Roster tab for rapid multi-player edits (jersey, position, height, weight, GPA, grad year, email, video link, and scouting pack inclusion) with 1-click save.
- **Confirmed Decision 3 (Non-URL PDF Label Handling)**: Validate `profilePdfUrl` and `profileDocUrl` on Player Cards so text labels (e.g., `"Eliot Kline Player Profile"`) hide the external PDF badge on the card and open the interactive Player Profile Modal instead of a broken link.
- **Confirmed Decision 4 (Firestore Source of Truth & Clean Notifications)**:
  1. Remove hardcoded photo and player overrides in `App.tsx` so Firestore is the true single source of truth.
  2. Replace blocking browser `window.alert()` calls with clean, non-blocking in-app toast notifications.

---

### 1. Overview & Core Concept

- **What It Does**: Eliminates manual double-entry for the coaching and management staff by connecting player profiles to a saved Google Sheet / inline bulk grid editor and automating weekly ECNL Northern California GU16 match score and 12-team conference standings updates.
- **Target Audience / Persona**: Team Administrators / Head Coach (managing weekly updates in seconds) and College Scouts / Families (viewing accurate player profiles, match results, and conference standings).
- **Key Value**: Guarantees player details stay accurately in sync across every view, and keeps both De Anza Force's schedule and the entire 12-team ECNL NorCal GU16 league table current.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Weekly ECNL NorCal GU16 Auto-Check & 1-Click Sync**:
     - When opening the Admin Suite (or Standings/Schedule editor tabs), if more than 7 days have passed since `lastEcnlSyncAt`—or when clicking **"Sync ECNL NorCal GU16"**—the backend queries the ECNL Northern California GU16 schedule (`ECNLG_0808235238.aspx`) and standings (`ECNLG_0808235831.aspx`) data, supported by server-side Gemini structured extraction and a **"Smart Paste ECNL Page"** option if external firewall rules block automated requests.
     - A **Sync Review Preview Modal** displays newly completed De Anza Force match scores (`teamScore - opponentScore`) and a side-by-side comparison of rank, GP, W-L-D, GF, GA, GD, PTS, and PPG changes across all 12 NorCal GU16 clubs.
     - Clicking **"Approve & Publish Updates"** atomically updates the Schedule, Standings, and Hero Season Record / Recent Form in Firestore.
  2. **1-Click Saved Google Sheet Roster Sync with Field Diffs**:
     - The Admin Spreadsheet Sync tab stores your Google Sheet URL in Firestore.
     - Clicking **"Fetch & Compare Live Sheet"** parses the sheet and highlights exact field-level changes per player (e.g., `GPA: 3.90 → 4.05`, `Height: 5'6" → 5'7"`) before saving.
  3. **Inline Admin Spreadsheet Grid Mode**:
     - Inside the Admin Roster tab, a **"Card List / Bulk Grid"** toggle switches the player list into a high-density editable table where any cell can be modified inline and saved in one click.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-contrast athletic command center combining broadcast-style sports telemetry with clean SaaS data density.
  - *Color Palette & Mood*: Deep pitch-slate surfaces (`#080c14`, `#0b1220`), Force Cyan (`#00ADEF`) primary interactive accents, Crimson (`#DC2626`) live/alert badges, and Emerald (`#10B981`) diff highlights for newly synced scores and updated player attributes.
  - *Typography & Hierarchy*: Condensed athletic display headers (`font-condensed font-black uppercase`) paired with `tabular-nums` monospace alignment for standings metrics and diff previews.
  - *Component Styling & Layout*: 12-column responsive layout with sticky table headers, subtle `1px` slate borders (`border-slate-800/80`), and zero layout shift when switching between list and bulk-edit grid views.
- **Interactive Feedback & Motion**:
  - Non-blocking toast banners for all sync, upload, and validation events.
  - Pulsing badge indicator when weekly ECNL updates or unsaved inline grid edits are pending review.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid ECNL Sync Architecture (Direct Fetch + AI Structured Extraction + Smart Paste)**
  - *Chosen Approach*: Route ECNL synchronization through an Express backend endpoint (`/api/ecnl/sync`) that fetches ECNL / Total Global Sports data (`orgId=9`, `orgSeasonId=80`, Northern California GU16) and uses server-side `@google/genai` structured JSON extraction (`responseSchema`) to normalize both match scores and the 12-team standings table, paired with a Smart Paste text/HTML input in the review modal.
  - *Why*: Combines automated server-side retrieval + AI search/extraction + instant copy-paste fallback so weekly updates work reliably even if ECNL's widget provider throttles cloud IPs.
- **Decision 2: Rightmost Column Precedence & Fuzzy Header Mapping in CSV Parser**
  - *Chosen Approach*: Update the CSV/Sheet parser so non-empty values in rightmost duplicate columns (`Height`, `Weight`, `GPA`) override earlier columns, and `"Contact Info for the Flyer"` maps to `contactEmail`.
  - *Why*: Matches the exact column layout of the team's master Google Sheet without requiring manual sheet restructuring.
- **Decision 3: Strict URL Validation for Recruiting Document Links**
  - *Chosen Approach*: Validate that `profilePdfUrl` / `profileDocUrl` begins with `http://`, `https://`, `data:application/pdf`, or a valid `.pdf` path before rendering the external PDF badge on Player Cards.
  - *Why*: Prevents broken navigation when spreadsheet cells contain descriptive text notes like `"Eliot Kline Player Profile"`, routing card clicks cleanly to the Player Profile Modal.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Client Application (React)                       │
│                                                                         │
│  ┌─────────────────────────┐          ┌──────────────────────────────┐  │
│  │   Public Showcase UI    │          │     Admin Management Suite   │  │
│  │  - Hero (Record & Form) │          │  - Bulk Roster Grid Editor   │  │
│  │  - Roster (Valid PDFs)  │          │  - Saved Google Sheet Diff   │  │
│  │  - Schedule & Standings │          │  - ECNL Weekly Sync & Review │  │
│  └────────────┬────────────┘          └──────────────┬───────────────┘  │
└───────────────┼──────────────────────────────────────┼──────────────────┘
                │                                      │
      Real-Time Hydration                    POST /api/ecnl/sync
      (No Hardcoded Overrides)               (Auto-Check & Manual)
                │                                      │
┌───────────────▼────────────────┐      ┌──────────────▼───────────────┐
│       Firebase Firestore       │      │   Express Server (server.ts) │
│  - players (Single Source)     │      │  - TGS / ECNL Data Fetcher   │
│  - matches & standings (12x)   │      │  - @google/genai Structured  │
│  - teamInfo (sheetUrl, syncAt) │      │    Score & Table Parser      │
└────────────────────────────────┘      └──────────────────────────────┘
```

- **Data Model & State Extensions**:
  - `TeamInfo`: Add optional `rosterGoogleSheetUrl?: string`, `scheduleGoogleSheetUrl?: string`, `lastEcnlSyncAt?: string`, and `ecnlAutoCheckEnabled?: boolean`.
  - `Player`: Hydrate all attributes cleanly from Firestore without hardcoded per-player photo overrides.
  - `StandingTeam` & `Match`: Support full 12-team NorCal GU16 standings updates alongside De Anza Force fixture score synchronization.
- **Interactive Component & State Mapping**:
  - **Admin Bulk Roster Grid**: Tracks dirty cells locally, supports inline editing across all key recruiting attributes, and commits atomically to Firestore.
  - **Google Sheet Diff Preview**: Computes a per-player field diff (`before` vs. `after`) between current Firestore `players` and incoming CSV rows before saving.
  - **ECNL Sync Review Modal**: Triggered automatically when `lastEcnlSyncAt` is older than 7 days (in Admin) or on-demand via the **"Sync ECNL NorCal GU16"** button in the Schedule and Standings tabs.
