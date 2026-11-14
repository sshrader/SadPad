# SadPad

A pump.fun launchpad where every coin claims a sad little voxel friend as its logo. Anyone can launch from their own wallet. The character they get is locked to their coin for good, and reports the coin's public numbers on its coin page.

This is its own service: its own data volume, env vars and domain. It lives at the root of this repo, so Railway needs no Root Directory.

- **`/`** is the whole app: a skippable intro (a rainy park, seen from above, where the characters follow each other round the puddles until the visitor presses Proceed), then the launchpad over a gloomy pixel room. The intro is a 3D scene (`intro3d.js`, plain WebGL2) and the characters' voxels come from `/api/agent/<n>/voxels.json`. Browsers without WebGL2, or slow ones, get a 2D version.
- A launcher connects Phantom, picks an open agent (or asks for a random one), names the coin, and launches. The launch uses the official `@pump-fun/pump-sdk`, with the launcher's first buy in the same transaction.
- **Classes and abilities:** each agent has a class with one special ability (Holder Radar, Cap Tracker, Dev Watch, Record Board, Milestone Log, Graduation Pace, Self-Check, Plain Brief, Authority Audit, Launch Block Scan, Sell Impact; PRIME has Command Sweep). They only use public chain numbers and what the agent saw on earlier visits (kept in `watch-<cluster>.json`). None of them trades or predicts.
- **Sad friends:** 3D voxel characters built by code (`sad.js`): a rain cloud, ghost, clown and onion (the weepers) and a robot, cactus, slice of toast and blob (the moper). Each has colour sets, tears or a frown and sometimes a beanie, a plaster or a tired flower. Even slots are weepers and odd slots are mopers, so the teams stay level. They run, walk and sob in 3D; the home page keeps a Weepers & Mopers scoreboard.
- **Classes:** weepers are `SNIFFLER`, `MOURNER`, `LONER`, `DIARIST`; mopers are `WORRIER`, `DOOMSAYER`, `PESSIMIST`, `SKEPTIC`. Each maps to a report in `report.js` (`ability.fn`) that works from real chain numbers.
- **The agent report** (`report.js`) is on every coin page. It turns the numbers read from the chain into plain sentences: curve progress and milestones, market cap, dev share, top-10 concentration, holder count, and flags for a large dev or concentrated holders. It only reads public data. It does not trade, hold funds, predict prices or give advice, and the page says so. It is built from the same cached chain read as the rest of the coin page.
- **PRIME:** one flagship outside the numbered set, a big storm cloud in a gold crown that cries gold, launchable only by `FOUNDER_WALLET`.
- **Reserve, then lock:** picking an agent holds it for 15 minutes. After the launch lands, the server reads the transaction from the chain (signed by that wallet, includes the new mint and the pump.fun program) and only then locks the agent to the coin.
- **Recent launches**, the **Creator fees** panel and **coin pages** (`/coin/<mint>`) are on the same pages. The fee payout calls were written from pump.fun's docs and need a devnet check.
- **The logo** is the held character, drawn by the server as a 512 by 512 PNG. The founder wallet may upload its own logo instead (the browser squares it to a 512 px PNG; the server refuses it from anyone else).
- **Fees:** no platform fee on the launch. Trading creator fees are split 95% to the launcher and 5% to `PLATFORM_WALLET`, set up by the launcher's wallet after the launch. The launcher has to approve that step, so the 5% is a request the page makes, not something the server can force.
- Starts on **devnet**. Set `CLUSTER=mainnet` only when you are ready for real SOL.

## Run

```
npm install
npm run build  # bundles the pump.fun launch code to dist/launch.js
npm start      # http://localhost:3000
npm test
```

Needs Node 20 or newer. The server itself uses no packages; only the browser launch bundle needs `npm install`.

## Settings (environment variables)

| Variable | Purpose |
| --- | --- |
| `CLUSTER` | `devnet` (default) or `mainnet`. Each keeps its own set of claimed characters. |
| `RPC_URL` | Your private **mainnet** RPC URL (for example Helius). Used only when `CLUSTER=mainnet`. A Helius URL also gives full holder counts. |
| `DEVNET_RPC_URL` | Optional private devnet endpoint. Devnet never reads from `RPC_URL`. |
| `PLATFORM_WALLET` | Receives 5% of each coin's creator fees. If unset, there is no split. |
| `FOUNDER_WALLET` | The one wallet that may launch PRIME. |
| `SLOTS` | How many characters exist, 1 to 100. Default 4. |
| `PUBLIC_URL` | This service's domain, used in each coin's metadata and logo links. Set it before any mainnet launch: those links are permanent. |
| `IMAGE_SECRET` | Optional. Decides how each agent looks and is named. If unset, one is created in the data folder. |
| `BLOCKED_WORDS` | Optional, comma separated. Extra words refused in names, tickers and descriptions. |
| `ADMIN_TOKEN` | Password for `/admin`, where you can see every agent, free a locked one or attach a coin to one. Off while unset. |
| `DATA_DIR` | Where agent state, logos and metadata are stored. Defaults to `/data` if it exists. Attach a Railway volume at `/data`: a coin's logo link points here. |

## Deploy on Railway

1. Add a service from this repo with no Root Directory, and attach a volume mounted at `/data`.
2. Set `PUBLIC_URL`, `PLATFORM_WALLET`, `FOUNDER_WALLET` and (for mainnet) `RPC_URL`. Add this service's own domain.
3. Test on devnet first, which is the default.

## Limits to know

- Anyone can launch, so names and tickers go through a basic word filter only. SadPad does not vouch for any coin.
- The agents report; they do not act. A coin's agent has no promised value and says nothing about where the price is going.
- The 5% fee split depends on the launcher signing it.
- A hold lasts 15 minutes. If a launch lands but the page closes before the agent is locked, it frees up when the hold expires (or you can attach it from `/admin`).
- Back up the data folder. It holds which agent belongs to which coin.
