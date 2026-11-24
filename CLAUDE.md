# CLAUDE.md — UK XC League Analyser

Static site charting how the UK XC League standings developed through each season, 2005 to 2026. Read `README.md` for how to use the page, the data format, and how to rebuild and deploy.

## Files
- `index.html`: the whole app (HTML, CSS, JS in one file, no libraries, no build step). Main parts: `buildModel` (daily best-6 score and rank per pilot, and best-4 score and rank per club), `entities()` / `E` (the standings shown, pilots or clubs; line, legend, table and selection code go through it), `clubBars` / `renderClubBars` (club Breakdown view), `selection`, `renderLines` and line highlighting, `flightBars` (which flights get a bar), `renderBars` (the Breakdown view), `timeAxis`, `TYPE_KINDS` (flight-type icons), the wiring in `setupUI`, and season loading in `loadSeason` / `applySeason`.
- `build.js`: converts the league API exports into the `data/` files. Running `node build.js` builds every season plus `data/seasons.json`.
- `data/league-YYYY.json` and `data/seasons.json`: generated; don't edit by hand.
- `raw/league-YYYY.json`: the original exports from `https://xcleague.com/xc/api.php?output=json&service=flights&year=YYYY`, 2005–2026, each downloaded once on 23 Nov 2026.

## Rules that must stay true
- League score = the **sum of a pilot's best 6 flights** to date. The league year runs **1 Nov to 31 Oct**.
- Rank: pilots with equal scores share a rank, and pilots with no flights yet are unranked.
- A pilot's glider is the one flown on their **highest-scoring flight**, which matches the official table.
- Pilots who share a name (two Richard Carters) are told apart by club.
- The best-6 rule held in every season from 2005 to 2026 (confirmed by the user). Nov–Oct fits every season's flights.
- Club score = the **sum of the club's best 4 pilots' league scores** (`clubN`). Clubs are ranked like pilots. Verified against the official 2026 Club Flights table for the top 4 clubs.
- **Verified:** the final standings match the official 2026 table for the top 30 on rank, name, club, total and glider. The totals also match: 2,393 flights, 169,400.3 points, 277 pilots. Re-check this after any change to `build.js` or `buildModel`.

## Data and the league's website
- The league has given permission to publish. The site serves its own copy of the data, and visitors only reach xcleague.com by clicking a flight link.
- Don't add anything that fetches from xcleague.com at runtime. robots.txt is `Disallow: /`, so any scheduled fetch (for a live season) must be agreed with the league first.
- Flight-type icons are **our own drawings**, following the league's conventions: white symbol on a blue tile, **yellow symbol = declared**, **green tile = tow launch**. Don't copy the league's image files.

## Design decisions (settled with the user)
- **Colours:** each pilot keeps their colour while on screen, and colour follows the pilot, never their rank. There are 8 colours; lines 9–16 are dashed and 17–24 dotted.
- **View names:** the View buttons are **Compare** (the line chart) and **Breakdown** (stacked bars, one pilot or club). These were chosen with the user.
- **Compare view:**
  - The legend sits **below** the chart; names are not drawn at the line ends.
  - Hovering a line, legend entry or table row picks that pilot out. Clicking a line or row pins them, and clicking again or Esc releases.
  - Clicking a legend name opens that pilot's (or club's) Breakdown view.
  - The Period fits the first and last flights of the pilots shown.
- **Breakdown view (one pilot):**
  - Stacked vertical bars on a time axis, one bar per flying day, oldest flight at the bottom.
  - The final best 6 flights are coloured; replaced flights are grey.
  - A step line shows the total. A hollow circle marks a flight that never counted.
  - **All bars are the same width.** The default time scale is **Compact** (a run of g days without flights takes 0.5×√g slots); Calendar is the alternative.
  - No outline on the newest segment.
  - The Breakdown **Show** filter (formerly "Flights shown") has three options: All (the default), Scoring (leaves out flights that never counted) and Best (only the final best 6, with the line still showing the league total). Changing it refits the Period, the bar width and the compression.
  - The pilot table below the chart is hidden in this view; pilots are chosen in the Pilot box.
  - The summary above follows the league-table style: total, then each flight's score with its type icon.
- **Standings: Pilots / Clubs.** Clubs follow the pilot UX: the same Show modes (except "Club"), line chart, legend, highlight and table. The club Breakdown view stacks the counting pilots, with colours for the final 4 and grey for replaced pilots, and clicking a pilot opens their Breakdown view. Pilots and clubs each keep their own choices.
- **Pilot lists:** every pilot is listed, shown and sorted as "Surname, First name".

## Working on it
- **Run locally:** `npx serve .`, or `python -m http.server`. The page has to be served over HTTP to load the JSON; opening the file directly won't work.
- **Check visually** after UI changes: Compare view with the top 10 and top 20, both Rank and Score; Breakdown view for a couple of pilots, both time scales; light and dark mode.
- **Keep `README.md` up to date** whenever behaviour changes.
- **Tooltips:** every control has one, set in `setTips()` and worded for pilots or clubs. When a control is added or changed, update its tooltip there, not in the HTML.
- **The user** knows JavaScript, HTML, GitHub and Cloudflare, works in VS Code, and deploys on Cloudflare Pages (static, no build command). They prefer reviewing changes visually, and dislike charts where marks vary in width.

## Open ideas
- A Breakdown view for several pilots at once (small multiples were suggested).
- Spot-check a few older seasons' pilot and club tables against the official ones.
- Shareable URLs that keep the selection.
- **Live season feed (if ever built):** plan how to deal with flights that are later deleted, invalidated or re-scored. The export only shows the current list, so the rebuilt history would silently change. Consider keeping daily snapshots or diffs, and decide whether to show standings as they were on the day or as corrected. Agree any scheduled fetch with the league first.
- More filters: glider class, flight type, biggest movers between two dates.
