# Player Profile Modal Redesign & Match Stats Removal Plan

## 1. Overview & Goals
Remove individual player match statistics (`Appearances`, `Starts`, `Goals`, `Assists`, `Clean Sheets`, `Saves`, and `Minutes`) from both the public **Player Profile Modal** and the **Admin Player Editor**, and restructure the Player Profile Modal from a 4-tab view into a **unified single-view scouting sheet** that presents all recruiting information at a glance.

---

## 2. Visual Layout & Architecture (Unified Single-View Modal)

Currently, the modal repeats the player's scouting bio in both the top summary header and the first tab, while hiding Academics, NCAA ID, PDF Profile links, Accolades, and Game Film behind separate tabs. Removing Match Stats allows us to present all essential recruiting details in a single cohesive layout:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [X Close]                                                               │
│  ┌────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │                    │  │ [Position Tag] [Secondary Pos] [Grad Year] │  │
│  │   PLAYER PORTRAIT  │  │ FIRST & LAST NAME             [Recruiting] │  │
│  │                    │  │ High School • Hometown                     │  │
│  │                    │  │                                            │  │
│  │  ┌────┐            │  │ Scouting Bio & Player Summary Paragraph    │  │
│  │  │ #9 │            │  │                                            │  │
│  │  └────┘            │  │ ┌─────────┬─────────┬──────┬─────────────┐ │  │
│  └────────────────────┘  │ │Ht / Wt  │Dom Foot │ GPA  │Email / Phone│ │  │
│                          │ └─────────┴─────────┴──────┴─────────────┘ │  │
│                          └────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│  UNIFIED SCOUTING & RECRUITING BODY (All Sections Visible at a Glance)   │
│                                                                          │
│  ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ ACADEMICS & NCAA ELIGIBILITY     │ │ HONORS, ACCOLADES & SOCIAL     │ │
│  │ • Cumulative GPA                 │ │ • Verified Athletic & Academic │ │
│  │ • High School & Class Year       │ │   Awards Grid                  │ │
│  │ • NCAA Eligibility ID (+ Copy)   │ │ • Official Profile PDF Flyer   │ │
│  │                                  │ │   Download CTA (if available)  │ │
│  │                                  │ │ • Athlete Instagram Link       │ │
│  └──────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ GAME FILM & MATCH HIGHLIGHTS (Shown when video link is present)    │  │
│  │ • Embedded Video Player (YouTube / Vimeo / Veo) OR                 │  │
│  │ • External Highlight Reel Card (Hudl)                              │  │
│  └────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│  FOOTER: Recruiting Inquiry Contact + Coach Paul Bravo Direct Email CTA  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Planned Changes

### A. Unified Single-View Player Profile Modal
1. **Remove Match Stats & Tab Bar**:
   - Remove the 4-tab navigation bar (`Bio & Accolades`, `Match Stats`, `Game Film & Video`, `Academics & NCAA`) and its tab-switching state.
   - Remove the `Match Stats` panel (`Appearances`, `Starts`, `Goals`/`Clean Sheets`, `Assists`/`Saves`, `Minutes Played`, and the ECNL verification footnote).
2. **Eliminate Redundant Bio Box**:
   - Keep the player's scouting bio paragraph in the top hero header (immediately below their name and school) and display any **Secondary Positions** alongside their primary position badge in the header so it is never duplicated below.
3. **Two-Column Recruiting & Credentials Grid**:
   - **Left Column — Academics & NCAA Eligibility**:
     - Displays `Cumulative GPA`, `High School (Class of YYYY)`, and `NCAA Eligibility ID` (with one-click copy button) in a compact card layout.
   - **Right Column — Honors, Accolades & Official Profile Flyer**:
     - Displays the player's verified honors and accolades list (with a clean fallback when none are listed yet).
     - Displays the **Official Player Profile PDF Flyer** download card whenever a valid profile URL is linked, plus the athlete's Instagram profile link when available.
4. **Full-Width Game Film & Match Highlights Section**:
   - Directly below the credentials grid, render the player's embedded highlight video (YouTube, Vimeo, Veo, or direct MP4) or external Hudl highlight card when a video link is on file. Omit the "Request Match Film" placeholder box entirely when no video URL is present.

### B. Admin Player Editor Simplification
1. **Remove Match Stat Input Fields**:
   - Remove the **Verified Matchday Season Statistics** section (`Appearances`, `Starts`, `Goals`, `Assists`, `Clean Sheets`, `Saves`, and `Minutes`) from the Admin Player Editor form.
   - Preserve underlying data structure compatibility so existing player records in the database continue to load and save seamlessly without requiring migration.

---

## 4. Verification Plan
- Verify that opening any player from the Roster grid displays the unified single-view modal with zero match stat blocks, zero duplicate bio text, and immediate visibility of Academics/NCAA, Accolades, Profile PDF download, and Game Film (when a video link exists, without any "Request Match Film" placeholder).
- Verify that opening the Admin Player Editor shows the streamlined player form without the Matchday Season Statistics inputs, and that saving player edits continues to work cleanly.
- Run full project linting and build verification to confirm zero TypeScript or compilation issues.
