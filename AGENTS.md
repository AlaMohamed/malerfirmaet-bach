# AGENTS.md — Working notes for AI assistants on this repo

This file gives Claude (and any other AI agent collaborating on the project)
the standing procedures and conventions for working on the codebase.

---

## 🚨 STANDING PROCEDURE — Commit + push after EVERY meaningful change

After **every** code change session (when something has been edited and verified),
the assistant MUST run the full commit + push routine before reporting the work
as finished. This keeps `origin/main` always in sync with what's live, gives the
user a recoverable history, and means accidental file loss can't wipe progress.

### The routine

1. **Sanity-check working tree**
   ```bash
   git status
   ```

2. **Scan for accidentally committed secrets** before staging
   ```bash
   grep -rnE "(re_[A-Za-z0-9]{15,}|key_[a-f0-9]{20,}|0x4AAAAA[A-Za-z0-9]{10,}|BEGIN PRIVATE KEY|sk-[A-Za-z0-9]{30,})" \
     --include="*.md" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" \
     . 2>/dev/null | grep -v "node_modules\|\.next\|\.vercel\|\.git/"
   ```
   If anything turns up: redact before staging. **`.env.local` MUST never be staged.**

3. **Stage changes** (use `-A` for new + modified + deleted)
   ```bash
   git add -A
   ```

4. **Verify what's staged** — show file list + scan again
   ```bash
   git diff --cached --name-only
   git diff --cached | grep -iE "(api[_-]?key|secret|token|password)" | head -5
   ```

5. **Commit with a clear message** (HEREDOC for clean multi-line)
   ```bash
   git commit -m "$(cat <<'EOF'
   <subject — under 70 chars>

   <body — what changed and why; bullet points OK>

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```

6. **Push to origin/main**
   ```bash
   git push origin main
   ```

7. **Confirm to the user** what was committed and pushed (commit SHA + summary).

### When NOT to commit

- The user has explicitly asked for a draft / exploratory change they may revert.
- Work is half-finished and pushing it would break `origin/main` for someone
  else who pulls. (Rare — we're not in a team setting here.)
- The change is purely investigative (reading files, running commands, looking
  at logs — no file edits).

### Commit-message style

- **Subject line**: imperative mood, ≤ 70 chars, no trailing period.
  Good: `Fix Sofia address gathering — split into 3 mini-steps`
  Bad: `Updated some files`
- **Body**: explain *why* not just *what*. Bullet points OK for multiple changes.
- **Always include** the `Co-Authored-By: Claude…` trailer.
- Reference specific files/areas when relevant.

---

## 🔒 Secrets management

These files MUST NEVER be committed:

- `site/.env.local` (and any `.env.*.local`)
- Any `*service-account*.json` or `*credentials*.json`
- Any file containing real API keys, OAuth tokens, or private keys

`.gitignore` covers these patterns. If a secret is accidentally committed:

1. Revoke it immediately in the issuing service (Cloudflare, Resend, Retell,
   Google Cloud, Twilio, etc.)
2. Regenerate and update `.env.local` and Vercel environment variables
3. Use `git filter-repo` or BFG to scrub the secret from history before pushing
   (if not pushed yet) or accept the leak and rotate everything (if pushed)

The user keeps real credentials in `site/.env.local` on their local machine
and mirrors them to Vercel's project Environment Variables for production.

---

## 🛠 Project layout

```
malerfirmaet-bach/
├── site/                   Next.js 14 production site
│   ├── src/app/            App router (pages + API routes)
│   ├── src/components/     React components
│   ├── src/content/        Hardcoded content (Notion-stand-in)
│   ├── src/lib/            Server-side libraries (drive, calendar, email)
│   ├── public/             Static assets (logo, favicon, images)
│   ├── scripts/            Build helpers (image optimization, logo cropping)
│   └── .env.example        Env-var template (no real secrets)
│
├── projekt-info/           Documentation
│   ├── customer-info-malerfirmaet-bach.md   Full customer profile
│   ├── fase-2-sofia-direct-booking.md       Sofia architecture decisions
│   ├── sofia-prompt.md                       Retell agent prompt
│   └── sofia-knowledge-base/                 6 KB docs for Retell upload
│
├── assets/                 Original media (logo, project photos)
├── dokumenter/             Generated docs (PowerPoint)
├── kilder/                 Original HTML source content
├── AGENTS.md               This file
└── .gitignore              Comprehensive ignore rules
```

---

## 🚢 Deployment pipeline

The site lives on Vercel at **https://malerfirmaet-bach.vercel.app** (stable
alias) with a per-deploy URL too. Production deploys happen via:

```bash
cd site
npm run build      # local sanity build
vercel --prod --yes
```

Environment variables on Vercel mirror `site/.env.local` exactly. When adding
a new var, update both places.

---

## 📋 Working agreements with the user

- **One thing at a time** is preferred for setup steps requiring manual action
  (Twilio, Cloudflare, Retell config). Wait for "klar" before next step.
- **Ask before complex changes** when there are multiple sensible approaches —
  the user is decisive and prefers being consulted on architecture.
- **Danish** is the working language for all customer-facing copy. Internal
  code comments and AGENTS.md can be English.
- **Step-by-step explanations** preferred over walls of code.

---

## 🧪 Sofia (Retell AI agent) — operational notes

- Production phone: **+45 91 30 95 35** (Twilio SIP-trunk → Retell)
- Agent: `agent_7d005d83b00f4c463a698e12cc`
- Working hours: Mon–Fri 07:00–17:30 (enforced server-side)
- `SOFIA_TEST_MODE=true` on Vercel currently — bypasses hours check for testing.
  **Remove before go-live to prevent night-time customer calls.**
- Custom Functions endpoints:
  - `https://malerfirmaet-bach.vercel.app/api/sofia/availability`
  - `https://malerfirmaet-bach.vercel.app/api/sofia/book`
- Webhook for call summaries:
  - `https://malerfirmaet-bach.vercel.app/api/retell/webhook`
- Prompt + knowledge base in `projekt-info/`.

---

*Last reviewed: 14. maj 2026*
