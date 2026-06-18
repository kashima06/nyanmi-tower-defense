# Codex Handoff: にゃんみちゃん TD

This file is for future Codex sessions. It is intentionally technical and is not written as player-facing documentation.

Last updated: 2026-05-25

## Project Shape

- Workspace: `D:\タワーディフェンス`
- App type: browser-playable tower defense game
- Stack: plain `HTML / CSS / JavaScript`, no build step
- Main files:
  - `index.html`: static shell and UI containers
  - `styles.css`: all layout, board, title, unit, and animation styling
  - `script.js`: full game data, stage data, state machine, rendering, combat, save/load
  - `assets/`: generated and processed raster assets

Open `index.html` directly in a browser, or serve the folder with a small local HTTP server if file URL behavior becomes annoying.

## Current Game State

The game currently has:

- Title screen with generated illustration.
  - Title: `にゃんみちゃんの守れ！防衛ライン`
  - Buttons: `はじめから`, `つづきから`
- 5 x 10 battle field.
  - Enemies move from right to left.
  - Units can be placed in the left 4 columns.
- Campaign stage system with 4 stages.
  - Stage 1: `にゃんみちゃん` only, 1-wave placement tutorial, about 5 enemies.
  - Stage 2: `にゃんみちゃん` + `パステルちゃん`, 1-wave healing tutorial, one durable enemy.
  - Stage 3: `リーファ` only, piercing attack tutorial, many enemies in the same row.
  - Stage 4: all current units, original multi-wave battle.
- Save/continue through `localStorage`.
  - Key: `nyanmi-defense-save-v1`
- Hover range preview for deployed units.
  - Uses `state.hoveredUnitId`, `renderRangePreview()`, `getRangePreviewRect()`.
- Deployed field unit display is no longer just a circular icon.
  - It uses battle sprites / motion sheets where available.
- Scenario episodes are inserted around the early campaign stages.
  - Pre-stage stories exist for stages 1, 2, and 3.
  - Post-stage stories exist after clearing stages 1, 2, and 3.
  - Stage 4 currently has no dedicated pre-stage episode; stage 3 post-story points toward it.
- The visible skill command panel has been removed from the lower dock.
  - Roster cards now show `className / skill` instead of `className / note`.
  - The placement/log panel is hidden; `log()` still writes to the hidden DOM node for debug continuity.
- When combat starts (`body.is-running`), both side cards are hidden so the battle field expands as much as possible.

## Important Balance / Data Notes

Constants near the top of `script.js`:

- `ROWS = 5`
- `COLS = 10`
- `PLACEABLE_COLS = 4`
- `COST_RECOVERY_RATE = 1.4`
- `DEFAULT_DEPLOY_COOLDOWN = 25`
- `DEPLOY_COOLDOWNS = { nyanmi: 30, leafa: 18 }`
- Initial cost is stage-defined and currently starts at `20`.
- Most unit/enemy HP and attack damage values were scaled 10x from the earlier balance pass, then some unit attacks were tuned down again.
  - Saved unit HP from older pre-scale saves is detected during load and multiplied by 10 when it is clearly an old-scale value.
- `state.deployCooldowns` tracks per-character placement cooldowns. Placing one unit starts a cooldown for that same unit ID only; other unit IDs can still be placed if cost allows.
- Unit cards show both cost and remaining redeploy cooldown when cooling down.

Important unit IDs:

- `nyanmi`: displayed as `にゃんみちゃん`
  - Current attack damage is `220`.
  - Attack range is self-centered surrounding 1 cell: `shape: "around"`.
- `pastel`: displayed as `パステルちゃん`
  - Healer only: `canAttack: false`, `damage: 0`.
  - Uses the supplied `パステル回復` motion sheet.
- `yami`: displayed as `闇にゃみ`
- `lunaria`: displayed as `リア`
  - Keep the internal ID as `lunaria` unless doing a careful migration.
  - Name was changed to `リア`.
  - Attack interval was slowed to `4.06`.
  - Attack range is front 2 x 3: `shape: "frontBox"`, `range: 2`, `rangeRows: 3`.
- `leafa`: displayed as `リーファ`
  - The user later referred to a supplied archer motion as `フィオ`.
  - Treat the supplied `フィオ` attack motion as the current `leafa` / archer unit unless the user explicitly asks for a rename.
  - Damage was reduced and currently uses piercing attack: `pierce: true`, `damage: 40`.
- `riku`: displayed as `リク`
  - The user supplied this swordsman motion as `レオン攻撃`.
  - Keep mapping that material to current internal ID `riku` unless the user explicitly asks for a data rename.

## Asset Map

Generated / main assets:

- `assets/title-illustration.png`
  - Title screen image.
- `assets/battlefield.png`
  - Main board background.
- `assets/heroes-lineup.png`
  - Character roster / portrait source.

Generated scenario episode illustrations:

- `assets/episode-stage1.png`
  - Village entrance / Nyanmi solo defense.
- `assets/episode-stage2.png`
  - Road rescue / Nyanmi and Pastel healing support.
- `assets/episode-stage3.png`
  - Forest path / Fio piercing arrow scene.

Scenario implementation notes:

- `storySequences` in `script.js` contains pre/post episode pages.
- `openStory(kind, stageIndex)` opens the large visual story overlay.
- `moveStory(delta)` and `closeStory()` drive story paging.
- The overlay DOM is `#storyOverlay` in `index.html`, styled around `.story-card` / `.story-visual` / `.story-copy` in `styles.css`.
- The design intentionally splits text into short pages so the story body should not need scrolling.

Attack motion source sheets copied from user-provided files:

- `assets/motion-nyanmi.png`
- `assets/motion-fio.png`
- `assets/motion-ria.png`
- `assets/motion-leon.png`
- `assets/motion-pastel.png`

Processed transparent/cutout motion sheets actually referenced by the game:

- `assets/motion-nyanmi-cutout.png`
- `assets/motion-fio-cutout.png`
- `assets/motion-ria-cutout.png`
- `assets/motion-leon-cutout.png`
- `assets/motion-pastel-cutout.png`

Do not delete the non-cutout originals casually; they are useful source backups if cutout quality needs to be regenerated.

Enemy sprite source sheets copied from user-provided files:

- `assets/enemy-weak.png`
- `assets/enemy-strong.png`

Processed transparent/cutout enemy sheets actually referenced by the game:

- `assets/enemy-weak-cutout.png`
- `assets/enemy-strong-cutout.png`

Both enemy cutout sheets are `1280 x 640`, arranged as 4 columns x 2 rows, each frame `320 x 320`.

Enemy sprite implementation notes:

- `ENEMY_SPRITES` in `script.js` maps `weak0..weak7` and `strong0..strong7` to the two cutout sheets.
- `enemyDefs.*.spriteOptions` assigns a rotating set of sprites per enemy type.
- `state.enemySerial` rotates variants as enemies spawn, and is reset on stage reset/load.
- `renderEnemySprite(enemy, def)` renders `.enemy-sprite`; `.enemy-body` remains as a fallback if a future enemy has no sprite.
- `styles.css` sizes image enemies with `.enemy`, `.enemy.boss`, and `.enemy-sprite`.

## Attack Motion Implementation

Motion definitions are in `script.js`:

```js
const UNIT_MOTIONS = {
  nyanmi: { src: "assets/motion-nyanmi-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.7 },
  pastel: { src: "assets/motion-pastel-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.85 },
  leafa: { src: "assets/motion-fio-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.52 },
  lunaria: { src: "assets/motion-ria-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.82 },
  riku: { src: "assets/motion-leon-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.62 }
};
```

Relevant functions:

- `triggerAttackMotion(unit, def, scale = 1)`
- `getUnitMotionFrame(unit, motion)`
- `renderUnitSprite(unit, def)`
- `fireAt(unit, target, def)`
- `healUnit(source, target, amount)`
- `activateSkill(unit)`

Runtime fields added to deployed unit objects:

- `attackTimer`
- `attackDuration`

Attack/heal/skill calls trigger a temporary animation by setting those fields. `draw()` maps the timer into an 8-frame sheet and renders `.unit-sprite.has-motion`.

Units without a dedicated motion sheet fall back to a non-circular `heroes-lineup.png` sprite with a simple CSS attack reaction.

## Visual / CSS Notes

Deployed unit size is controlled in `styles.css`:

```css
.unit {
  width: min(10.9%, 108px);
  aspect-ratio: 1;
}
```

At the verified desktop board size, one cell was about `93px` and the deployed unit box was about `101px`, so characters now occupy roughly one grid cell.

The cutout motion sheets are transparent PNGs with `1280 x 640` dimensions, arranged as 4 columns x 2 rows, each frame `320 x 320`.

The cutouts were generated by local image processing from the provided full-background or checkerboard sheets. They are not perfect studio-grade alpha masks. `motion-fio-cutout.png` in particular still has a warm/yellow edge halo because the original archer sheet had colors close to the board background. If the user asks for cleaner results, regenerate true transparent sprites from image generation or ask for transparent source sheets.

## Prior User Requests Already Applied

High-level list of notable completed changes:

- Built the browser TD game in plain HTML/CSS/JS based on the attached reference images.
- Generated title illustration and game assets.
- Added title screen.
- Removed the old top text labels from the game screen and expanded the battle-board area.
- Removed class-feature text from the battle status/tactics area.
- Changed initial cost to 20.
- Changed cost recovery to `1.4`.
- Reduced `リーファ` damage and made it piercing.
- Changed `にゃんみちゃん` attack range to surrounding 1 cell.
- Renamed visible `ルナリア` to `リア`.
- Slowed `リア` attack interval.
- Changed `リア` attack range to front 2 x 3 cells.
- Added multi-stage campaign with tutorial stages.
- Added hover attack range preview.
- Changed deployed units from icon display to field unit sprite display.
- Added attack motion for `にゃんみちゃん`, archer (`leafa` using `フィオ` motion), and `リア`.
- Reprocessed the supplied attack sheets into transparent/cutout sheets to avoid board-background mismatch.

## Verification Notes

Basic syntax check:

```powershell
node --check script.js
```

Headless Chrome / Playwright has worked using the bundled Node dependencies plus installed Chrome:

```powershell
$root='C:\Users\kenta\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH="$root;$root\.pnpm\node_modules"
```

Use this file URL form for Japanese path reliability:

```text
file:///D:/%E3%82%BF%E3%83%AF%E3%83%BC%E3%83%87%E3%82%A3%E3%83%95%E3%82%A7%E3%83%B3%E3%82%B9/index.html
```

Avoid constructing the file URL with naive `path.resolve(...).replace(...)` in Node if it turns the Japanese folder name into question marks. A bad URL has previously opened `D:\` directory listing instead of the game.

The in-app Browser tool has sometimes been blocked for local `file://` or `localhost` verification. If that happens, use shell-driven Playwright and installed Chrome:

```js
const { chromium } = require("playwright");
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
```

## Encoding Warning

PowerShell `Get-Content` output may show mojibake for Japanese text depending on console encoding, even when the browser renders correctly. Do not broad-rewrite Japanese strings just because terminal output looks garbled. Prefer targeted `apply_patch` edits and verify in browser.

## Cleanup / File Notes

There are several `verification-*.png` screenshots in the project root from previous visual checks. They are not runtime assets. They can be ignored unless the user asks for cleanup.

The runtime asset set is in `assets/`; the currently used motion assets are the `*-cutout.png` files.

## If Continuing Work

Recommended next steps if the user asks for more polish:

- Generate or request a transparent battle motion sheet for the remaining unit: `yami`.
- Clean or regenerate `motion-fio-cutout.png` if the archer halo bothers the user.
- Consider separating attack VFX from character body sprites, so character sprites stay compact and projectiles/ice/slash effects are rendered by game logic.
- Add a stage select screen before story insertion.
- Add story interstitials between stages, probably between `resetGame(nextStageIndex)` transitions and `enterGameScreen()`.
