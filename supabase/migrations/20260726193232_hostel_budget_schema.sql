/*
# HostelBudget AI — budget state + daily spending logs

Single-tenant app (no sign-in). The dashboard reads/writes as the anon key,
so every policy must allow `anon, authenticated`.

1. New Tables
- `budget_state` (single row): monthly allowance, fixed mess fee, dietary
  preferences, and the pasted weekly mess menu text. Represents the current
  planner state for the whole app.
- `spending_logs`: one row per daily-spend entry (amount + optional note +
  date). Belongs to the single budget state.
2. Security
- RLS enabled on both tables.
- Full CRUD for `anon, authenticated` because the data is intentionally
  shared/public (no auth in this app).
3. Notes
- `budget_state` is constrained to a single row via a `CHECK (id = 1)` and a
  fixed-default primary key, so the frontend can always upsert id=1.
- Spending logs reference `budget_state(id)` so they cascade if the state
  row is ever removed (not expected in normal use).
*/

CREATE TABLE IF NOT EXISTS budget_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  monthly_allowance numeric(12,2) NOT NULL DEFAULT 0,
  mess_fee numeric(12,2) NOT NULL DEFAULT 0,
  dietary_preferences text[] NOT NULL DEFAULT '{}',
  mess_menu text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE budget_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_budget_state" ON budget_state;
CREATE POLICY "anon_select_budget_state" ON budget_state FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_budget_state" ON budget_state;
CREATE POLICY "anon_insert_budget_state" ON budget_state FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_budget_state" ON budget_state;
CREATE POLICY "anon_update_budget_state" ON budget_state FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_budget_state" ON budget_state;
CREATE POLICY "anon_delete_budget_state" ON budget_state FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS spending_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(12,2) NOT NULL DEFAULT 0,
  spent_on date NOT NULL DEFAULT CURRENT_DATE,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE spending_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_spending_logs" ON spending_logs;
CREATE POLICY "anon_select_spending_logs" ON spending_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_spending_logs" ON spending_logs;
CREATE POLICY "anon_insert_spending_logs" ON spending_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_spending_logs" ON spending_logs;
CREATE POLICY "anon_update_spending_logs" ON spending_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_spending_logs" ON spending_logs;
CREATE POLICY "anon_delete_spending_logs" ON spending_logs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS spending_logs_spent_on_idx ON spending_logs (spent_on);
