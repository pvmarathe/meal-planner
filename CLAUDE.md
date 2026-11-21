# CLAUDE.md: notes for any Claude session working in this repo

Read this first. It tells a fresh session what this project is, how it is built, the owner's standing rules, and the traps already hit. The repo is **public**, so nothing personal (names, weights, email addresses, routine IDs) is written here. Where that private information lives is explained below.

## What this is

PlanMate (tagline: plan, shop, cook together) is a pure-vegetarian meal planner for two people who cook one pot, plus an email "accountability agent" that runs on a schedule. The owner is **not a developer**: explain things in plain words, and say what you changed and why. See `README.md` for the plain-language tour and a system diagram, and `how-it-works.html` for the science.

- **Website** (static files on GitHub Pages, no server, no build step): `index.html` (planner), `recipes.html` (recipe database), `how-it-works.html`.
- **Planning brain:** `core.js`, shared by the website and the agent. It has no page code, so it also runs in Node.
- **Data:** `data.js` holds every recipe and its nutrition. Section order matters little; recipe `id`s and sections with `inPlanner: false` matter (see below).
- **Page code:** `planner.js` (plan view), `recipes.js` (database page), `reminders.js` (prep tips used by the agent; the page's calendar-download box was removed because emails replace it), `common.js`, `style.css`.
- **Email agent tool:** `agent/agent.js`. It loads `data.js`, `common.js`, `reminders.js` and `core.js` in Node and prints emails.

Live site: https://pvmarathe.github.io/meal-planner/ (GitHub repo `pvmarathe/meal-planner`, branch `main`).

## Standing rules from the owner (follow these unless they say otherwise)

1. **Ask before every push to `main`.** Pushing `main` updates the live website **and** changes what the scheduled agents run (they clone `main` on every run). Commit locally, then ask: "Want me to update the live site?" Risky changes go on a branch first (see "Changing the emails safely").
2. **No attribution lines in commits or PRs:** no `Co-Authored-By: Claude` and no "Generated with Claude Code".
3. **Ask before destructive or outward-facing actions** (force-push, deleting files, sending email to anyone, rewriting history). The owner once approved a history rewrite for privacy reasons; that does not carry over to new ones.
4. **Pure vegetarian, no eggs, ever.**
5. **Never guess missing recipe amounts.** If a recipe leaves out a key amount, its `macros` is `{na: "reason"}` and the card says why.
6. **Every recipe in the planner collection has its own verified ingredient list with quantities and its own video link**, with no duplicate names or video IDs. Nutrition is per serving, and the card says what a serving is and whether it came from the source or was assumed.
7. **Do not bypass blocks** (Cloudflare challenge pages, YouTube's internal APIs, anything that says no). Report it and use another source.
8. **Keep the site and its history free of any mention of the private app the "More recipes" collection came from.** Describe them only as "More recipes". Do not name the source anywhere public. (A real YouTube channel whose name happens to contain a similar word is unrelated and stays.)
9. **Build new projects only under `~/apps/`.**
10. Be honest about uncertainty: say when a number is an estimate or a proxy, and report test failures with their output.

## How the planner works (so you can change it safely)

- Daily calories come from ICMR-NIN 2020 reference values (man 65 kg, woman 55 kg; sedentary, moderate, heavy), scaled by weight. The heavy-work figure for women is estimated from the men's, and the site says so.
- Day split 30/35/35 (breakfast, lunch, dinner). Macro windows: protein 15-35%, carbs 45-65%, fat 20-35%. Meals must land within 10% of target.
- `solveOne` (one person) and `solvePair` (two people, same dishes, separate portions) search thousands of combinations. A recipe is only picked if it has a `meals` tag, valid macros and a section not marked `inPlanner: false`.
- Recipes with `dailyWith: "lunch"` (the sattu cucumber drink) are added to every lunch and the rest of the meal is balanced around them.
- A plan item is `{id, s, s2}`: `s` is the first person's servings, `s2` the second's. A two-person plan has `people: [...]`.
- Recipes with no video use `video: null` and an explicit `id` (video IDs normally double as the recipe `id`). The "More recipes" sections (ids start with `more-`) are `inPlanner: false` and are folded on the recipes page.

## The email agent (the part that is easy to break)

Three scheduled cloud routines (created with the `RemoteTrigger` tool, managed at https://claude.ai/code/routines) clone this repo's `main` and run `node agent/agent.js ...`, then send the output with the Gmail connector:

| Routine | When | Does |
|---|---|---|
| weekly plan | Wednesday 6 pm US Eastern | `plan` for next Monday to Sunday, emails it |
| morning nudges | every day 9 am Eastern | shopping list on Saturday, otherwise nothing |
| evening replies and nudges | every day 8:30 pm Eastern | reads replies, applies edits, sends prep reminders |

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
- Dish names in emails link to the recipe video (or the recipe card on the site when there is no video). Gmail cannot play video inside an email.
- Routines cannot be deleted through the API; the owner deletes them at the routines page. Cron times are UTC, so they shift an hour at daylight saving.

## Changing the emails safely

1. Create a branch (for example `html-emails`), change `agent/agent.js`, and push **the branch** (not `main`).
2. Preview locally by rendering the HTML in headless Chrome and looking at phone width (500 px) and desktop width (1300 px) screenshots.
3. Run a **one-time routine** that fetches the branch (`git fetch origin <branch> && git checkout <branch>`), builds the emails and sends them to the owner with a `TEST` subject. Scheduled agents ignore subjects starting with `TEST`, `FINAL TEST` or `FONT`.
4. When the owner is happy, and only after they say yes, merge to `main`, push, then update any routine prompt that needs new flags.

## Testing

- Syntax: `node --check core.js agent/agent.js planner.js recipes.js data.js`.
- Planner logic: load the page in headless Chrome (`--allow-file-access-from-files --dump-dom`) with a small test script appended, and check that generated meals are balanced, that no main dish repeats in a slot, that no "More recipes" dish is ever picked, and that the lunch drink is in every lunch. Old results: about 500 meals per scenario, all balanced for realistic pairs.
- Agent: `node agent/agent.js plan --today YYYY-MM-DD --days 3 --people '[...]' --format html`, then `rebuild --id "<its Plan ID line>"`, and compare the dishes: the same ID must give the same plan.
- Do not use `rm` on globs in this environment; a safety check blocks it. Use fresh directories instead.

## Where past decisions came from

The owner's profile, routine and preferences are in Claude's memory folder on their machine (not in this public repo). If something here is unclear or out of date, ask the owner and then update this file.
