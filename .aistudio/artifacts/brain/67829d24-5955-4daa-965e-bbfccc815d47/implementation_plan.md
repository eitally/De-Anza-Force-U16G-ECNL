# Scouting Brochure Coach Hierarchy & Title Update Plan

## Overview
We will update the printable Scouting Brochure and website Coaching Staff data to include Goalkeeper Coach **Larry Jackson**, reorganize the cover's coaching staff section into a two-tier hierarchy with Head Coach **Paul Bravo** featured prominently on the top row above **Yuta Tanaka** and **Larry Jackson**, and rename the brochure to **"De Anza Force U16G ECNL - Scouting Brochure"** across the cover, inside spread header, modal header, and PDF print filename.

---

## Visual Layout Mockup (Brochure Front Cover Panel)

```
+-----------------------------------------------------------------------+
|              ===   [ DE ANZA FORCE CREST ]   ===                      |
|                         DE ANZA FORCE                                 |
|                     U16G ECNL - 2010/2011                             |
|                       SCOUTING BROCHURE                               |
|                             2026                                      |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   | HEAD COACH • ECNL DIR                                         |   |
|   | PAUL BRAVO   (Slightly larger featured card)                  |   |
|   | (720) 475-6991  •  paulgbravo9@gmail.com                      |   |
|   | _____________________________________________________________ |   |
|   +---------------------------------------------------------------+   |
|                                                                       |
|   +------------------------------+ +------------------------------+   |
|   | STRENGTH & AGILITY COACH     | | GOALKEEPER COACH             |   |
|   | YUTA TANAKA                  | | LARRY JACKSON                |   |
|   | (650) 619-3670               | |                              |   |
|   | yuta.tanaka@gmail.com        | | Larry.Jackson@deanzaforce.org|   |
|   | ____________________________ | | ____________________________ |   |
|   +------------------------------+ +------------------------------+   |
|                                                                       |
|                  +---------------------------------+                  |
|                  |           [ QR CODE ]           |                  |
|                  |  https://www.deanzaforce2011g.com/                 |
|                  +---------------------------------+                  |
+-----------------------------------------------------------------------+
```

---

## Key Changes

### 1. Brochure Cover Coaching Hierarchy (`src/components/PrintScoutingPack.tsx`)
- **Top Tier (Full Width / Slightly Larger Card):**
  - **Paul Bravo** (`HEAD COACH • ECNL DIR`) placed on his own top row, with slightly larger typography (`text-sm print:text-xs` for name, `p-2.5 print:p-2` card padding) and his phone `(720) 475-6991` and email `paulgbravo9@gmail.com`.
- **Second Tier (2-Column Row Below Paul Bravo):**
  - Left Card: **Yuta Tanaka** (`STRENGTH & AGILITY COACH`), phone `(650) 619-3670`, email `yuta.tanaka@gmail.com`.
  - Right Card: **Larry Jackson** (`GOALKEEPER COACH`), email `Larry.Jackson@deanzaforce.org` (and optional phone if added later in Admin).

### 2. Brochure Naming & PDF Print Filename (`src/components/PrintScoutingPack.tsx`)
- Set the default brochure title state to `'SCOUTING BROCHURE'` so:
  - **Inside Spread Header (Page 1):** Displays `DE ANZA FORCE U16G ECNL - 2010/2011 • SCOUTING BROCHURE`.
  - **Front Cover (Page 2):** Displays `DE ANZA FORCE`, `U16G ECNL - 2010/2011`, and `SCOUTING BROCHURE` (editable via the top bar title customizer).
  - **PDF Print Document Title:** Temporarily sets `document.title = 'De Anza Force U16G ECNL - Scouting Brochure'` when triggering `window.print()` so browsers automatically name the saved PDF file **`De Anza Force U16G ECNL - Scouting Brochure.pdf`**, then restores the page title afterward.

### 3. Persist Larry Jackson in Default & Local Store (`src/data/defaultData.ts` & `data/team_store.json`)
- Add **Larry Jackson** (`id: "c_1794283308015"`, `name: "Larry Jackson"`, `role: "Goalkeeper Coach"`, `email: "Larry.Jackson@deanzaforce.org"`) to `INITIAL_COACHES` in `src/data/defaultData.ts` and `data/team_store.json` so he is always present in both the website's **Coaching & Staff** section and the **Scouting Brochure**, matching the live Firestore record.
