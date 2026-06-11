# ORCA launch setup (today) — Paystack + Composio + Vercel

Do this in order. Target: **site live today**, **first paying user by tomorrow daytime**.

---

## Part A — Deploy to Vercel (30 min)

1. Push latest `repos/orca` to GitHub `main`:
   ```bash
   cd C:\Users\John Kyalo\Desktop\repos\orca
   git add frontend/package.json frontend/package-lock.json frontend/ docs/
   git commit -m "Launch: pricing, founding API, Paystack/Composio docs, markdown deps"
   git push origin main
   ```
2. Vercel → project **Orca** → confirm **Root Directory** = `frontend` (if monorepo).
3. Wait for build green. If it fails on `react-markdown`, confirm `package-lock.json` was pushed.

**Required env vars on Vercel (Production + Preview):**

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_APP_URL` | `https://orca-sigma.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Same (secret) |
| `GEMINI_API_KEY` | Google AI Studio |
| `GROQ_API_KEY` | Groq console (fallback) |
| `PAYSTACK_SECRET_KEY` | Paystack → Settings → API Keys → **Secret** |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack → **Public** key (if used client-side) |

Redeploy after every env change.

---

## Part B — Paystack plans & env vars (45 min)

### B1. Create plans in Paystack

1. Log in: https://dashboard.paystack.com  
2. **Settings → API Keys** — copy **Test** keys first while testing, then **Live** for real money.  
3. **Plans** (or Subscriptions → Plans) → **Create plan** for each:

| Plan name | Amount | Interval | Used for |
|-----------|--------|----------|----------|
| ORCA Builder Monthly | **$29** (or KES/NGN equivalent) | Monthly | `PAYSTACK_PLAN_BUILDER_MONTHLY` |
| ORCA Builder Annual | **$288** total ($24/mo) | Annually | `PAYSTACK_PLAN_BUILDER_ANNUAL` |
| ORCA Pro Monthly | **$79** | Monthly | `PAYSTACK_PLAN_PRO_MONTHLY` |
| ORCA Pro Annual | **$780** total ($65/mo) | Annually | `PAYSTACK_PLAN_PRO_ANNUAL` |
| ORCA Founding Monthly | **$19** | Monthly | `PAYSTACK_PLAN_FOUNDING_MONTHLY` |

4. After each plan is created, copy the **Plan Code** (starts with `PLN_`).

> **Fast path tonight:** If you only create ONE plan at $19 or $29, set **all** Builder/Founding env vars to that same `PLN_` code until you add the rest.

### B2. Add to Vercel → Environment Variables

```env
PAYSTACK_SECRET_KEY=sk_live_xxxx

PAYSTACK_PLAN_BUILDER_MONTHLY=PLN_xxxx
PAYSTACK_PLAN_BUILDER_ANNUAL=PLN_xxxx
PAYSTACK_PLAN_PRO_MONTHLY=PLN_xxxx
PAYSTACK_PLAN_PRO_ANNUAL=PLN_xxxx
PAYSTACK_PLAN_FOUNDING_MONTHLY=PLN_xxxx

# Optional legacy fallbacks (if you still have old Starter plans):
PAYSTACK_PLAN_STARTER_MONTHLY=PLN_xxxx
PAYSTACK_PLAN_STARTER_ANNUAL=PLN_xxxx
```

### B3. Paystack webhook (so plan upgrades stick)

1. Paystack → **Settings → Webhooks**  
2. URL: `https://orca-sigma.vercel.app/api/billing/webhook`  
3. Events: at least `charge.success`, `subscription.disable`  
4. Save. Copy webhook secret if Paystack provides one (your app verifies via `PAYSTACK_SECRET_KEY` HMAC on body).

### B4. Test payment (before outreach)

1. Sign up on production with a **real email you control**.  
2. Settings → Billing → **Claim founding spot** or **Builder $29**.  
3. Pay with Paystack test card (test mode) or live card (live mode).  
4. You should land on `/dashboard/settings?tab=billing&success=true` and org `plan` = `builder` in Supabase.

**Supabase check:** Table `organizations` → column `plan` should be `builder` or `pro`.

### B5. Supabase founding tables

Run migration `007_vibe_coding_founding.sql` if not applied:

- `founding_config` (50 spots)  
- `founding_members`  

API: `GET /api/founding/status` → `{ remaining, available }`

---

## Part C — Composio (integrations) (30–60 min)

ORCA connects LinkedIn, Gmail, HubSpot, etc. through **Composio**.

### C1. Composio account

1. https://app.composio.dev — sign up / log in.  
2. **Settings → API Keys** → create key → copy value.

Add to Vercel:

```env
COMPOSIO_API_KEY=ak_xxxx
```

### C2. Create Auth Config per toolkit (fixes “no composio auth config”)

For each integration you need **this week** (minimum: **Gmail**, **LinkedIn**, **HubSpot**):

1. Composio dashboard → **Auth configs** → **Create auth config**  
2. Pick toolkit:
   - Gmail → toolkit `gmail`  
   - LinkedIn → `linkedin`  
   - HubSpot → `hubspot`  
   - Notion → `notion`  
   - Slack → `slack`  
   - GitHub → `github`  
3. Choose OAuth (Composio managed or your own OAuth app).  
4. Save → copy **Auth Config ID** (UUID).

Optional — paste IDs into Vercel (skips auto-lookup):

```env
COMPOSIO_AUTH_CONFIG_LINKEDIN=ac_xxxx
COMPOSIO_AUTH_CONFIG_HUBSPOT=ac_xxxx
COMPOSIO_AUTH_CONFIG_GMAIL_OUTREACH=ac_xxxx
COMPOSIO_AUTH_CONFIG_GOOGLE=ac_xxxx
COMPOSIO_AUTH_CONFIG_NOTION=ac_xxxx
COMPOSIO_AUTH_CONFIG_SLACK=ac_xxxx
COMPOSIO_AUTH_CONFIG_GITHUB=ac_xxxx
```

Service key in code = `service_key` from ORCA (e.g. `linkedin`, `gmail_outreach`).

### C3. Test one connection

1. Redeploy Vercel after `COMPOSIO_API_KEY` is set.  
2. ORCA → **Integrations** → connect **HubSpot** or **Gmail**.  
3. Should redirect to Composio OAuth → back with success toast.

If error persists: read the red banner on Integrations page (now shows exact fix).

---

## Part D — Tonight checklist (you, personally)

- [ ] Vercel build green  
- [ ] Paystack: at least Founding $19 plan + secret key in Vercel  
- [ ] Test checkout once yourself (founding or builder)  
- [ ] Composio: API key + auth config for Gmail + LinkedIn  
- [ ] Atlas chat: **Automate** mode + paste sprint prompt (see `ATLAS_10_PAYING_USERS_SPRINT.md`)  
- [ ] Send **20 DMs** tonight with founding link (not only “try free”)  

**Founding link flow:** Home → Pricing → Claim founding spot → Paystack → paid.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build: `react-markdown` not found | Push `package.json` + `package-lock.json`, redeploy |
| Checkout: Invalid plan | Missing `PAYSTACK_PLAN_*` env var for that tier |
| Payment ok but plan still free | Webhook URL wrong or `metadata.org_id` missing; check verify redirect |
| Composio: no auth config | Create auth config in Composio for that toolkit OR set `COMPOSIO_AUTH_CONFIG_*` |
| Composio: missing API key | Add `COMPOSIO_API_KEY` to Vercel, redeploy |
