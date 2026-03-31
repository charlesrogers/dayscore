# DayScore

## Stack
- Next.js 16, React 19, TypeScript 5, Tailwind v4
- `postgres` npm package for DB (NOT @vercel/postgres)
- Discord bot (bot/index.mjs) runs as separate container
- **Deployed on Coolify (Hetzner VPS)** at dayscore.imprevista.com

## Deployment
- `git push` to GitHub auto-deploys via GHCR + Coolify. Do NOT use Vercel.
- Coolify app UUID: `swxqiag2o25wb1g0vd09579j`
- Bot container: manually built on server at `/data/dayscore-bot/`. After changing `bot/index.mjs`, SCP to server and rebuild:
  ```
  scp bot/index.mjs root@95.216.205.160:/data/dayscore-bot/
  ssh root@95.216.205.160 "cd /data/dayscore-bot && docker build -t dayscore-bot:latest . && docker stop dayscore-bot && docker rm dayscore-bot && docker run -d --name dayscore-bot --restart unless-stopped --network coolify -e DISCORD_BOT_TOKEN=... -e DISCORD_CHANNEL_ID=1467627074608042166 -e CRON_SECRET=dayscore-cron-2026 -e DAYSCORE_API_URL=https://dayscore.imprevista.com dayscore-bot:latest"
  ```

## Database
- Self-hosted Postgres container `dayscore-db` on Hetzner (NOT Neon, NOT Vercel Postgres)
- Connection: `postgresql://dayscore:dayscore_pwd_2026@dayscore-db:5432/dayscore`
- Tables auto-created via `initDb()` in `src/lib/db.ts`

## Architecture
- **Bot** (`bot/index.mjs`): Discord WebSocket gateway, relays commands to Next.js API
- **API routes**: Handle conversation state machine, cron notifications, polls
- **Two paths for answers**: PATH A (bot → /api/discord-reply) and PATH B (cron/poll fallback)
- Both paths use DB-backed questions via `getQuestionsForTypeFromDb()`

## Cron Jobs (on Hetzner server, /etc/cron.d/coolify-apps)
- Poll: every 5 min
- Notifications: personal (3,4 UTC), morning (13,14 UTC), work (23,0 UTC), nightcap (4,5 UTC)
- Weekly: digest + week/month review (Sun 15-16:30 UTC)
- Relationship: Mon 1,2 UTC
- Budget guard: every 12h

## Health
- `/api/health` — pings DB, returns `{ ok: true }`
- Bot pings health every 5 min, alerts in Discord after 3 consecutive failures
