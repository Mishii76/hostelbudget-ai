import { useEffect, useState, useCallback } from 'react';
import { Wallet, ShieldCheck } from 'lucide-react';
import BudgetSettings from '@/components/BudgetSettings';
import BudgetTracker from '@/components/BudgetTracker';
import MessMenu from '@/components/MessMenu';
import AiAssistant from '@/components/AiAssistant';
import {
  loadBudgetState,
  upsertBudgetState,
  loadSpendingLogs,
} from '@/lib/api';
import type { BudgetState, SpendingLog } from '@/lib/supabase';

const DEFAULT_MENU = `MONDAY
Breakfast: Aloo Anda (potato + egg), Paratha, Chai
Lunch: Daal Chawal, Raita, Salad
Snacks: Samosa (1 pc)
Dinner: Chicken Karahi (small portion), Roti, Salad

TUESDAY
Breakfast: Chana Daal, Roti, Chai
Lunch: Sabzi (mix seasonal), Roti, Chawal
Snacks: Biscuits + Chai
Dinner: Aloo Qeema, Roti, Kheer

WEDNESDAY
Breakfast: Anda Paratha, Lassi, Chai
Lunch: Daal Maash, Chawal, Achaar
Snacks: Pakora (2 pc)
Dinner: Chana Daal, Roti, Sabzi

THURSDAY
Breakfast: Halwa Puri, Channay, Chai
Lunch: Aloo Gobi, Roti, Raita
Snacks: Maggi
Dinner: Chicken Shami, Roti, Chawal

FRIDAY
Breakfast: Naan Channay, Chai
Lunch: Daal Chawal, Achaar, Salad
Snacks: Roll Paratha (F-8 Markaz stall)
Dinner: Palak Paneer, Roti, Chawal

SATURDAY
Breakfast: Aloo Paratha, Dahi, Chai
Lunch: Mix Sabzi, Roti, Papad
Snacks: Gol Gappay
Dinner: Daal Makhani, Naan, Salad

SUNDAY
Breakfast: Nihari, Naan, Chai
Lunch: Chicken Pulao, Raita, Achaar
Snacks: Jalebi
Dinner: Veg Biryani, Raita, Papad`;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyAllowance, setMonthlyAllowance] = useState(25000);
  const [messFee, setMessFee] = useState(12000);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(['Vegetarian', 'High Protein', 'Budget-Saver']);
  const [messMenu, setMessMenu] = useState(DEFAULT_MENU);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [logs, setLogs] = useState<SpendingLog[]>([]);

  const refreshLogs = useCallback(async () => {
    try {
      const l = await loadSpendingLogs();
      setLogs(l);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load spending logs.');
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [state, logData] = await Promise.all([loadBudgetState(), loadSpendingLogs()]);
      if (state) {
        setMonthlyAllowance(Number(state.monthly_allowance));
        setMessFee(Number(state.mess_fee));
        setDietaryPreferences(state.dietary_preferences ?? []);
        if (state.mess_menu) setMessMenu(state.mess_menu);
      }
      setLogs(logData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  async function handleSaveBudget(allowance: number, fee: number) {
    const saved = await upsertBudgetState({
      monthly_allowance: allowance,
      mess_fee: fee,
      dietary_preferences: dietaryPreferences,
      mess_menu: messMenu,
    });
    setMonthlyAllowance(Number(saved.monthly_allowance));
    setMessFee(Number(saved.mess_fee));
  }

  async function handlePrefToggle(pref: string) {
    const next = dietaryPreferences.includes(pref)
      ? dietaryPreferences.filter((p) => p !== pref)
      : [...dietaryPreferences, pref];
    setDietaryPreferences(next);
    try {
      await upsertBudgetState({
        monthly_allowance: monthlyAllowance,
        mess_fee: messFee,
        dietary_preferences: next,
        mess_menu: messMenu,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save preferences.');
    }
  }

  async function handleHostelSelect(key: string, rent: number, menu: string) {
    setSelectedHostel(key);
    setMessFee(rent);
    setMessMenu(menu);
    try {
      await upsertBudgetState({
        monthly_allowance: monthlyAllowance,
        mess_fee: rent,
        dietary_preferences: dietaryPreferences,
        mess_menu: menu,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save hostel selection.');
    }
  }

  async function handleMenuChange(v: string) {
    setMessMenu(v);
  }

  // Persist menu on blur via a debounced save when it diverges from server.
  async function handleMenuBlur() {
    try {
      await upsertBudgetState({
        monthly_allowance: monthlyAllowance,
        mess_fee: messFee,
        dietary_preferences: dietaryPreferences,
        mess_menu: messMenu,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the menu.');
    }
  }

  const totalSpent = logs.reduce((sum, l) => sum + Number(l.amount), 0);
  const remainingBudget = Math.max(0, monthlyAllowance - messFee - totalSpent);
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const spendingBreakdown = logs.map((l) => ({
    date: l.spent_on,
    amount: Number(l.amount),
    note: l.note,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">HostelBudget AI</h1>
              <p className="text-xs text-slate-500 leading-tight">Smart Budget & Meal Planner · F-8 Islamabad</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Keys kept server-side</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse text-slate-400">Loading your planner…</div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-5 sm:space-y-6">
                <BudgetSettings
                  monthlyAllowance={monthlyAllowance}
                  messFee={messFee}
                  selectedHostel={selectedHostel}
                  onSave={handleSaveBudget}
                  onHostelSelect={handleHostelSelect}
                />
                <BudgetTracker
                  monthlyAllowance={monthlyAllowance}
                  messFee={messFee}
                  logs={logs}
                  onLogsChanged={refreshLogs}
                />
              </div>
              <div className="space-y-5 sm:space-y-6">
                <MessMenu
                  messMenu={messMenu}
                  dietaryPreferences={dietaryPreferences}
                  onMenuChange={handleMenuChange}
                  onMenuBlur={handleMenuBlur}
                  onPrefToggle={handlePrefToggle}
                />
                <AiAssistant
                  input={{
                    monthlyAllowance,
                    messFee,
                    totalSpent,
                    remainingBudget,
                    daysLeft,
                    dietaryPreferences,
                    messMenu,
                  }}
                  spendingBreakdown={spendingBreakdown}
                />
              </div>
            </div>

            <footer className="mt-10 text-center text-xs text-slate-400">
              <p>HostelBudget AI · Built for hostel students in Sector F-8, Islamabad. Budget data is saved automatically.</p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
