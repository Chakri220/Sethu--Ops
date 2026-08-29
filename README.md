# Sethu Ops — India-side fulfillment dashboard

The team dashboard for processing orders. Reads the same Supabase 'orders'
table the customer app writes to. Requires login (Supabase Auth).

Ops moves orders through:
  requested → confirmed (enter actual price) → out_for_delivery → delivered

---

## STEP A — Turn on login in Supabase (do this once, ~5 min)

1. Go to supabase.com → your Sethu project.
2. Left menu → Authentication → Providers → make sure **Email** is ON.
   - While testing, turn OFF "Confirm email" (Authentication → Providers →
     Email → uncheck "Confirm email") so accounts work instantly.
3. Create the team accounts: Authentication → Users → "Add user" →
   "Create new user". Enter an email + password for each person
   (you, your wife, your helper). Do this for each teammate.

## STEP B — Deploy (same flow as the other sites)

1. GitHub: new repo 'sethu-ops' → upload top-level files (index.html,
   package.json, package-lock.json, vite.config.js, README.md).
2. Add the src folder files: src/App.jsx, src/main.jsx, src/supabase.js
   (use Add file → Create new file → name 'src/App.jsx' etc.).
3. Vercel: Add New → Project → import 'sethu-ops' → Deploy.
   You get a new URL like sethu-ops-xxxx.vercel.app — that's the ops site.

## STEP C — Test the full loop

1. Open the ops URL → log in with an account you created.
2. You should see existing orders (e.g. "Dinner for AMMA") under "Needs action".
3. Open it → enter the actual price → "Confirm order placed".
4. It moves to "In progress" → "Mark out for delivery" → "Mark delivered".
5. Each change saves to the database and moves the order across tabs.

---

## Note on security
The orders table currently has an open access policy ("allow all for now").
Before real customers, this should be tightened so only logged-in team
members can read/update orders. Ask Claude to help lock it down when you're
ready to go live for real.
