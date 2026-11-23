# CLAUDE.md — UK XC League Analyser

Static site charting how the UK XC League 2026 standings developed through the season. Read `README.md` for how to use the page, the data format, and how to rebuild and deploy.

## Files
- `index.html`: the whole app (HTML, CSS, JS in one file, no libraries, no build step). Main parts: `buildModel` (daily best-6 score and rank per pilot), `selection`, `renderLines` and line highlighting, `renderBars` (the Flights view), `timeAxis`, `TYPE_KINDS` (flight-type icons), and the wiring in `setupUI`.
- `build.js`: converts the league API export into `league-2026.json`. Run it with `node build.js raw/league.json league-2026.json`.
- `league-2026.json`: generated; don't edit by hand.
- `raw/league.json`: the original export from `https://xcleague.com/xc/api.php?output=json&service=flights&year=2026`.

## Rules that must stay true
- League score = the **sum of a pilot's best 6 flights** to date. The league year runs **1 Nov to 31 Oct**.
- Rank: pilots with equal scores share a rank, and pilots with no flights yet are unranked.
- A pilot's glider is the one flown on their **highest-scoring flight**, which matches the official table.
- Pilots who share a name (two Richard Carters) are told apart by club.
- **Verified:** the final standings match the official 2026 table for the top 30 on rank, name, club, total and glider. The totals also match: 2,393 flights, 169,400.3 points, 277 pilots. Re-check this after any change to `build.js` or `buildModel`.

## Data and the league's website
- The league has given permission to publish. The site serves its own copy of the data, and visitors only reach xcleague.com by clicking a flight link.
- Don't add anything that fetches from xcleague.com at runtime. robots.txt is `Disallow: /`, so any scheduled fetch (for a live season) must be agreed with the league first.
- Flight-type icons are **our own drawings**, following the league's conventions: white symbol on a blue tile, **yellow symbol = declared**, **green tile = tow launch**. Don't copy the league's image files.

## Design decisions (settled with the user)
- **Colours:** each pilot keeps their colour while on screen, and colour follows the pilot, never their rank. There are 8 colours; lines 9–16 are dashed and 17–24 dotted.
- **Line view:**
  - The legend sits **below** the chart; names are not drawn at the line ends.
  - Hovering a line, legend entry or table row picks that pilot out. Clicking pins them, and clicking again or Esc releases.
  - The Period fits the first and last flights of the pilots shown.
- **Flights view (one pilot):**
  - Stacked vertical bars on a time axis, one bar per flying day, oldest flight at the bottom.
  - The final best 6 flights are coloured; replaced flights are grey.
  - A step line shows the total. A hollow circle marks a flight that never counted.
  - **All bars are the same width.** The default time scale is **Compact** (a run of g days without flights takes 0.5×√g slots); Calendar is the alternative.
  - No outline on the newest segment.
  - The summary above follows the league-table style: total, then each flight's score with its type icon.
- **Pilot lists:** every pilot is listed, shown and sorted as "Surname, First name".

## Working on it
- **Run locally:** `npx serve .`, or `python -m http.server`. The page has to be served over HTTP to load the JSON; opening the file directly won't work.
- **Check visually** after UI changes: line view with the top 10 and top 20, both Rank and Score; Flights view for a couple of pilots, both time scales; light and dark mode.
- **Keep `README.md` up to date** whenever behaviour changes.
- **The user** knows JavaScript, HTML, GitHub and Cloudflare, works in VS Code, and deploys on Cloudflare Pages (static, no build command). They prefer reviewing changes visually, and dislike charts where marks vary in width.

## Open ideas
- A Flights view for several pilots at once (small multiples were suggested).
- A season dropdown, using other years from the same API.
- Shareable URLs that keep the selection.
- More filters: glider class, flight type, biggest movers between two dates.
