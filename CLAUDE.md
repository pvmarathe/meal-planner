# CLAUDE.md: notes for any Claude session working in this repo

Read this first. It tells a fresh session what this project is, how it is built, the owner's standing rules, and the traps already hit. The repo is **public**, so nothing personal (names, weights, email addresses, routine IDs) is written here. Where that private information lives is explained below.

## What this is

PlanMate (tagline: plan, shop, cook together) is a vegetarian meal planner (with eggs) for two people who cook one pot, plus an email "accountability agent" that runs on a schedule. The owner is **not a developer**: explain things in plain words, and say what you changed and why. See `README.md` for the plain-language tour and a system diagram, and `how-it-works.html` for the science.

- **Website** (static files on GitHub Pages, no server, no build step): `index.html` (planner), `recipes.html` (recipe database), `how-it-works.html`.
- **Planning brain:** `core.js`, shared by the website and the agent. It has no page code, so it also runs in Node.
- **Data:** `data.js` holds every recipe and its nutrition. Section order matters little; recipe `id`s and sections with `inPlanner: false` matter (see below).
- **Page code:** `planner.js` (plan view), `recipes.js` (database page), `reminders.js` (prep tips used by the agent; the page's calendar-download box was removed because emails replace it), `common.js`, `style.css`.
- **Email agent tool:** `agent/agent.js`. It loads `data.js`, `common.js`, `reminders.js` and `core.js` in Node and prints emails.

Live site: https://pvmarathe.github.io/meal-planner/ (GitHub repo `pvmarathe/meal-planner`, branch `main`).

## Standing rules from the owner (follow these unless they say otherwise)

1. **Ask before every push to `main`.** Pushing `main` updates the live website **and** changes what the scheduled agents run (they clone `main` on every run). Commit locally, then ask: "Want me to update the live site?" Risky changes go on a branch first (see "Changing the emails safely").
2. **No attribution lines in commits or PRs:** no `Co-Authored-By: Claude` and no "Generated with Claude Code".
3. **Ask before destructive or outward-facing actions** (force-push, deleting files, sending email to anyone, rewriting history). The owner has approved history rewrites for privacy reasons twice; that does not carry over to new ones. The latest was on 2026-11-26: the last two commits were rebuilt as one clean commit, `main` was force-pushed and a leftover work branch was deleted. Old commit IDs from before that date (for example `4bec36f`) no longer exist on any branch, but GitHub may still serve them by direct link until GitHub Support purges them. Any other clone must re-sync with `git fetch origin && git reset --hard origin/main`.
4. **Vegetarian, with eggs (the owner changed this on 2026-11-25; the earlier rule was no eggs).** No meat or fish. Egg dishes live only in the `Eggs` section of `data.js` (Boiled Eggs, Masala Omelette), tagged as breakfast sides with `group: "eggs"` (never two in one meal) and `weight: 0.04` (picked less often; about two egg breakfasts a week for two people). Do not add eggs to other recipes without asking.
5. **Never guess missing recipe amounts.** If a recipe leaves out a key amount, its `macros` is `{na: "reason"}` and the card says why.
6. **Every recipe in the planner collection has its own verified ingredient list with quantities and its own video link**, with no duplicate names or video IDs. Nutrition is per serving, and the card says what a serving is and whether it came from the source or was assumed.
7. **Do not bypass blocks** (Cloudflare challenge pages, YouTube's internal APIs, anything that says no). Report it and use another source.
8. **Keep the site and its history free of any mention of the private app the "Recipe shelf" collection came from.** Describe them only as "Recipe shelf" (the owner renamed the collection from "More recipes" on 2026-11-26). Do not name the source anywhere public. (A real YouTube channel whose name happens to contain a similar word is unrelated and stays.)
9. **Build new projects only under `~/apps/`.**
10. Be honest about uncertainty: say when a number is an estimate or a proxy, and report test failures with their output.

## How the planner works (so you can change it safely)

- Daily calories come from ICMR-NIN 2020 reference values (man 65 kg, woman 55 kg; sedentary, moderate, heavy), scaled by weight. The heavy-work figure for women is estimated from the men's, and the site says so.
- Day split 30/35/35 (breakfast, lunch, dinner). Macro windows: protein 15-35%, carbs 45-65%, fat 20-35%. Meals must land within 10% of target.
- `solveOne` (one person) and `solvePair` (two people, same dishes, separate portions) search thousands of combinations. A recipe is only picked if it has a `meals` tag, valid macros and a section not marked `inPlanner: false`.
- Recipes with `dailyWith: "lunch"` (the sattu cucumber drink) are added to every lunch and the rest of the meal is balanced around them.
- A plan item is `{id, s, s2}`: `s` is the first person's servings, `s2` the second's. A two-person plan has `people: [...]`.
- Fresh fruits (`Fresh fruits` section, recipes with `dailyPick: "breakfast"` and no `meals` tag) work like the daily drink: `fruitFor` in `core.js` adds one random fruit to every breakfast, only from fruits in season (US East Coast, the `months` list on each fruit; no `months` means all year) for that day's date, never the same as yesterday's and the rest of the meal is balanced around it. They have no videos (nothing to cook), so each has an explicit `id`.
- **Plan generation (important).** `seed=auto` and `seed=auto2` plans (everything emailed up to the week of Nov 30, 2026) must rebuild exactly as made, so they run generation 2 (`GEN` in `core.js`). New plans use `seed=auto3` (the default in `agent.js plan`) and the website uses generation 3. Generation 3 adds: recipes with `since: 3` and `dailyWith` (the **Morning routine** section: one tablespoon of extra virgin olive oil and the soaked nut and seed platter, added to every breakfast and judged outside the macro balance, see `routineSplit`/`checkMeal`); a rule that a side is not repeated at the same meal the day before or after (`recentSides`); half portions for breakfast mains; and `often` (0 to 1) on a recipe, the chance a rare side is kept (`pickSide`, `chooseBest`; the egg dishes and Ragi Porridge carry it). Never change generation 2 behaviour: after any `core.js` or `data.js` change, rebuild an `auto2` Plan ID and compare it with a plan made before the change (it must be identical, with the same `data=` fingerprint).
- **"Veggie Delights" import (Nov 26, 2026).** `more-ivd-*` sections (496 recipes, `inPlanner: false`, recipes page only) hold ingredient lists and the original page's nutrition per serving, with `url` (an extra "Full recipe" link) and its own YouTube video where it has one. The method text and photos are deliberately not copied, and each card credits and links to the source. Recipes with meat, fish or eggs would have been skipped (none were found). Every recipe in an `inPlanner: false` section has `tags: ["<main ingredient>"]` (Paneer, Lentil & Beans, Rice & Grains, Millet, Quinoa, Makhana, Pasta & Noodles, Vegetables, Other): the site's own category for its recipes, an automatic keyword guess for the rest (about 87% agreement with the site's labels). The recipes page shows them as filter buttons. These recipes never change the plan fingerprint. The cards and section titles call the source "Veggie Delights" (the `channel` and `from` fields; it was "Recipe library" for a few hours on Nov 26, 2026 and the owner then chose this name). On the recipes page the nine `more-ivd-*` sections sit together in one closed "Veggie Delights" group inside the Recipe shelf. The shelf also opens with "Show:" tabs (All, Veggie Delights, Everything else) that combine with the Style and Main ingredient filters. Recipe names were rewritten and ingredient lines restyled to the house style (tbsp/tsp, "½", "x, finely chopped") on Nov 26, 2026; the `id` slugs, `url` and `video` links, nutrition and tags are unchanged.
- Recipes with no video use `video: null` and an explicit `id` (video IDs normally double as the recipe `id`). The **Recipe shelf** is every section with `inPlanner: false` (the `more-*` sections plus Dressings; 990 recipes). Their titles start "Recipe shelf: ", their ids still start `more-` (do not rename ids), and the `more-` ones are folded on the recipes page. Each shelf section has a `style` field (Indian, Blue Zones, Mediterranean, Thai × Indian, Restaurant, Kids' lunch boxes or Dressings) that every recipe in it inherits; the recipes page has a **Style** filter and a **Main ingredient** filter (the recipe `tags`) that combine. A new shelf section needs both `style` and per-recipe `tags`; add any new style to `STYLE_ORDER` in `recipes.js`. On the recipes page the whole shelf is one closed block (`details#shelf`) that holds the Show tabs, the Style and Main ingredient filters and the sections; a search or filter that finds shelf recipes opens it, and links to `#shelf`, `#veggie-delights`, a shelf section or a shelf recipe open it first (`goToHash` in `recipes.js`). A new shelf section only needs `inPlanner: false`, a `style` and per-recipe `tags`; the code picks it up.

## The email agent (the part that is easy to break)

Three scheduled cloud routines (created with the `RemoteTrigger` tool, managed at https://claude.ai/code/routines) clone this repo's `main` and run `node agent/agent.js ...`, then send the output with the Gmail connector:

| Routine | When | Does |
|---|---|---|
| weekly plan | Wednesday 6 pm US Eastern | `plan` for next Monday to Sunday, emails it |
| morning nudges | every day 9 am Eastern | shopping list on Saturday, otherwise nothing |
| evening replies and nudges | every day 8:30 pm Eastern | reads replies, applies edits, sends prep reminders, and on Friday the "Shopping tomorrow: check your list" heads-up |

**Where the private configuration lives:** inside those three routines' prompts (the people's names, genders, weights and activity levels, the sender Gmail account, and the recipient addresses), not in this repo. To change any of it, read the routine with `RemoteTrigger get`, edit the prompt text, and send back the whole `job_config` with `update`. Claude's own memory folder also has notes about it. If you cannot find a detail, ask the owner.

`agent/agent.js` commands: `plan`, `rebuild`, `nudge`, `reroll`, `mode`, `away`, `decode`, `link` (usage is at the top of the file). Emails print as `SUBJECT: ...`, `FORMAT: html`, a blank line, then an HTML document. The cloud agent sends the HTML with the Gmail `send_message` tool's `htmlBody` parameter and a one-line `body`.

**The Plan ID is the memory.** Each plan email ends with a plain-text line like `Plan ID: start=... days=7 mode=fresh seed=auto2 data=... edits=...`. Later runs rebuild the exact same plan from it (plus the people config). A reply such as "change Thursday dinner" becomes an `edits` entry (`reroll:DATE:meal:N`, `away:DATE`, `back:DATE`, `mode:batch|fresh`).

Traps already hit (do not repeat):

- **Gmail rewrites links** when an email is read back, so never parse the planner link out of an email; read the `Plan ID:` line instead.
- **The cloud environment blocks `pvmarathe.github.io` (HTTP 403).** The agent must get the code from the git clone, never by downloading from the site. Do not try to work around the block.
- **`seed=auto` vs `seed=auto2`:** the first plan (week of Nov 23) used `auto`, which also mixed the people's names into the random seed; a rebuild of an `auto` plan uses the legacy names (`legacyNames`). New plans use `auto2`, which ignores names. Never change either seed's behaviour, or existing plans rebuild differently.
- **The `data=` fingerprint** covers only recipes the planner can pick from. Changing, adding or removing a planner recipe mid-week changes it, so a rebuilt plan can differ from the emailed one (the tool warns). Avoid such changes during an active week, or tell the owner.
- **The cloud agent copies the HTML by hand.** Keep emails compact (weekly plan about 30 KB, nothing above roughly 40 KB) and never ask it to retype long base64 links.
- **The Gmail phone app ignores `<style>` blocks.** All styling is also written inline (`inlineStyles` in `agent.js`); the `<style>` block only holds a wide-screen `@media` rule for desktop sizes and equal-height meal columns. Meals are table cells (`bgcolor` plus inline background) so they colour as full rectangles.
- Fonts: the owner chose **Verdana everywhere** (`--font readable`, the default). Gmail cannot load web fonts.
- The Saturday shopping email also carries a PDF of the list. The tool marks it with an `ATTACH: pdf` header line (line 3); the sender then runs `agent.js pdf` and attaches the base64 as `content` (file references to the sandbox are rejected; tested). If the attachment fails it sends the email without it.
- Dish names in emails link to the recipe video (or the recipe card on the site when there is no video). Gmail cannot play video inside an email.
- Routines cannot be deleted through the API; the owner deletes them at the routines page. Cron times are UTC, so they shift an hour at daylight saving.

## Changing the emails safely

1. Create a branch (for example `html-emails`), change `agent/agent.js`, and push **the branch** (not `main`).
2. Preview locally by rendering the HTML in headless Chrome and looking at phone width (500 px) and desktop width (1300 px) screenshots.
3. Run a **one-time routine** that fetches the branch (`git fetch origin <branch> && git checkout <branch>`), builds the emails and sends them to the owner with a `TEST` subject. Scheduled agents ignore subjects starting with `TEST`, `FINAL TEST` or `FONT`.
4. When the owner is happy, and only after they say yes, merge to `main`, push, then update any routine prompt that needs new flags.

## Publishing and checking the live site

- A push to `main` triggers a GitHub Pages build. Check it with `gh api repos/pvmarathe/meal-planner/pages/builds/latest --jq '.commit[0:7]+" "+.status'`: it must show the new commit and `built`. Then confirm a changed file is live with `curl -s "https://pvmarathe.github.io/meal-planner/<file>?x=$RANDOM"`.
- GitHub Pages lets browsers keep files for about 10 minutes, so the owner may still see the old page. Tell them to hard refresh (Cmd+Shift+R) before assuming something is broken.

## Testing

- Syntax: `node --check core.js agent/agent.js planner.js recipes.js data.js`.
- Planner logic: load the page in headless Chrome (`--allow-file-access-from-files --dump-dom`) with a small test script appended, and check that generated meals are balanced, that no main dish repeats in a slot, that no "Recipe shelf" dish is ever picked, and that the lunch drink is in every lunch. Old results: about 500 meals per scenario, all balanced for realistic pairs.
- **After any `data.js` or `core.js` change, prove the planner is untouched:** copy `data.js`, `core.js`, `common.js`, `reminders.js` and `agent/agent.js` from `git show main:<file>` into a scratch folder, run `agent.js plan` in both places with the same `--today`, `--days 7` and `--people`, and compare the output. It must be byte-for-byte identical (same `data=` fingerprint). Changes to the Recipe shelf, styles and tags never affect it.
- **Recipes page (filters, shelf, tabs):** copy `recipes.html` to a scratch file, add `<base href="file:///.../meal-planner/">` after `<head>`, append a small script that clicks the buttons (Show tabs, Style, Main ingredient) and writes counts into a `<pre>`, then run Chrome headless with `--allow-file-access-from-files --virtual-time-budget=10000 --dump-dom`. Check: 1127 rows in total, the Style counts add up to 990, the Show tabs are 496 + 494, and combinations behave. Screenshots (`--screenshot`) are a good final look. Use `file://` pages, not a local web server.
- Agent: `node agent/agent.js plan --today YYYY-MM-DD --days 3 --people '[...]' --format html`, then `rebuild --id "<its Plan ID line>"`, and compare the dishes: the same ID must give the same plan.
- Do not use `rm` on globs in this environment; a safety check blocks it. Use fresh directories instead.

## Where past decisions came from

The owner's profile, routine and preferences are in Claude's memory folder on their machine (not in this public repo). If something here is unclear or out of date, ask the owner and then update this file.
