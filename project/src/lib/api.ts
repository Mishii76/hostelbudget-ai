import { supabase, type BudgetState, type SpendingLog } from './supabase';

export interface StrategyInput {
  monthlyAllowance: number;
  messFee: number;
  totalSpent: number;
  remainingBudget: number;
  daysLeft: number;
  dietaryPreferences: string[];
  messMenu: string;
  spendingBreakdown: { date: string; amount: number; note: string }[];
}

export interface StrategyResult {
  strategy: string;
  source: 'openai' | 'anthropic' | 'local';
}

// Client-side fallback used if the edge function is unreachable or returns an
// error. Mirrors the server-side mock so the UI always shows a useful strategy.
const MOCK_STRATEGY = `### 📊 Budget Health Assessment
Current trajectory is stable, but your allowance of Rs. 25,000 leaves a thin margin after your Rs. 12,000 mess fee. Safe remaining spending is Rs. 433/day.

### 🗓️ Mess Hall Optimization Plan
- **Monday & Wednesday:** Eat at the hostel mess. The Chicken Karahi and Daal Chawal provide optimal value.
- **Friday Dinner:** Skip the mess (Aloo Sabzi lacks protein). Treat yourself to an affordable alternative.

### 💡 Cheap Local Upgrades (F-8 Markaz)
1. **Savour Foods (F-7 / Near G-9):** Grab a budget-friendly chicken pulao plate to split or stretch into two meals.
2. **F-8 Markaz Local Tandoor:** Buy fresh Roti/Naan for Rs. 25 and pair it with a cheap Rs. 120 egg-shami burger from local street stalls.
3. **Munchies / Local Dhabas:** Opt for affordable roll parathas in F-8 Markaz instead of expensive cafes.

### 🚀 Golden Financial Rule
Never spend more than Rs. 500 on any single meal outside the mess hall to keep your final week cash reserves safe.`;

export async function generateStrategy(input: StrategyInput): Promise<StrategyResult> {
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-strategy`;
  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(input),
    });

    if (!res.ok) throw new Error(`Strategy request failed (${res.status})`);

    const data = await res.json();
    if (data?.error) throw new Error(data.error);
    if (!data?.strategy) throw new Error('No strategy returned from the assistant.');

    return { strategy: data.strategy, source: data.source };
  } catch (err) {
    // Network/edge failure: fall back to the pre-written mock so the UI still
    // renders a realistic F-8 Islamabad strategy.
    console.warn('generateStrategy: using client-side mock fallback', err);
    return { strategy: MOCK_STRATEGY, source: 'local' };
  }
}

export async function loadBudgetState(): Promise<BudgetState | null> {
  const { data, error } = await supabase
    .from('budget_state')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data as BudgetState | null;
}

export async function upsertBudgetState(state: {
  monthly_allowance: number;
  mess_fee: number;
  dietary_preferences: string[];
  mess_menu: string;
}): Promise<BudgetState> {
  const { data, error } = await supabase
    .from('budget_state')
    .upsert({ id: 1, ...state, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as BudgetState;
}

export async function loadSpendingLogs(): Promise<SpendingLog[]> {
  const { data, error } = await supabase
    .from('spending_logs')
    .select('*')
    .order('spent_on', { ascending: false });
  if (error) throw error;
  return (data as SpendingLog[]) ?? [];
}

export async function addSpendingLog(amount: number, spentOn: string, note: string): Promise<SpendingLog> {
  const { data, error } = await supabase
    .from('spending_logs')
    .insert({ amount, spent_on: spentOn, note })
    .select()
    .single();
  if (error) throw error;
  return data as SpendingLog;
}

export async function deleteSpendingLog(id: string): Promise<void> {
  const { error } = await supabase.from('spending_logs').delete().eq('id', id);
  if (error) throw error;
}
