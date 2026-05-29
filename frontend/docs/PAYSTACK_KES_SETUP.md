# Paystack (KES) + USD display

## How it works

| Where | Currency | Example |
|-------|----------|---------|
| ORCA pricing page | **USD** | $29/mo Builder |
| Small line under price | **KES hint** | KES 3,999/mo at checkout |
| Paystack payment page | **KES** | Customer pays KES 3,999 |

Paystack only supports **KES** on your account. USD is for marketing clarity only.

---

## Monthly plans (create in Paystack — LIVE, KES)

| Tier | USD (website) | **KES (Paystack amount)** | Vercel env var |
|------|---------------|---------------------------|----------------|
| Founding | $19/mo | **2,499** / month | `PAYSTACK_PLAN_FOUNDING_MONTHLY` |
| Builder | $29/mo | **3,999** / month | `PAYSTACK_PLAN_BUILDER_MONTHLY` |
| Pro | $79/mo | **10,499** / month | `PAYSTACK_PLAN_PRO_MONTHLY` |

---

## Annual plans (create in Paystack — LIVE, KES)

| Tier | USD (website) | **KES (Paystack amount)** | Vercel env var |
|------|---------------|---------------------------|----------------|
| Builder | $288/yr ($24/mo) | **39,990** / year | `PAYSTACK_PLAN_BUILDER_ANNUAL` |
| Pro | $780/yr ($65/mo) | **104,990** / year | `PAYSTACK_PLAN_PRO_ANNUAL` |

Founding is **monthly only** (no annual founding plan).

---

## Vercel environment variables

```env
PAYSTACK_SECRET_KEY=sk_live_xxxx

# Monthly KES plans
PAYSTACK_PLAN_FOUNDING_MONTHLY=PLN_xxxx
PAYSTACK_PLAN_BUILDER_MONTHLY=PLN_xxxx
PAYSTACK_PLAN_PRO_MONTHLY=PLN_xxxx

# Annual KES plans (enable after creating)
PAYSTACK_PLAN_BUILDER_ANNUAL=PLN_xxxx
PAYSTACK_PLAN_PRO_ANNUAL=PLN_xxxx
PAYSTACK_ANNUAL_ENABLED=true
```

Redeploy after saving.

---

## Webhook

`https://orca-sigma.vercel.app/api/billing/webhook` — event `charge.success`

---

## Important

- Paystack plan **KES amount** must match the table (not the USD number).
- If you change KES prices, update `frontend/lib/pricing/config.ts` → `checkoutKes*` fields.
