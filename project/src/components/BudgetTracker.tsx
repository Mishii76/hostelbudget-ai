import { useState } from 'react';
import { Wallet, TrendingDown, TrendingUp, Plus, Trash2, CalendarDays } from 'lucide-react';
import type { SpendingLog } from '@/lib/supabase';
import { addSpendingLog, deleteSpendingLog } from '@/lib/api';

interface Props {
  monthlyAllowance: number;
  messFee: number;
  logs: SpendingLog[];
  onLogsChanged: () => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function BudgetTracker({ monthlyAllowance, messFee, logs, onLogsChanged }: Props) {
  const [amount, setAmount] = useState('');
  const [spentOn, setSpentOn] = useState(todayStr());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSpent = logs.reduce((sum, l) => sum + Number(l.amount), 0);
  const remaining = Math.max(0, monthlyAllowance - messFee - totalSpent);

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyLimit = remaining / daysLeft;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addSpendingLog(amt, spentOn, note.trim());
      setAmount('');
      setNote('');
      onLogsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the entry.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSpendingLog(id);
      onLogsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the entry.');
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Budget Tracker</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Monthly Allowance"
          value={`Rs. ${monthlyAllowance.toFixed(0)}`}
          icon={<Wallet className="w-4 h-4" />}
          tone="slate"
        />
        <StatCard
          label="Total Spent"
          value={`Rs. ${totalSpent.toFixed(0)}`}
          icon={<TrendingDown className="w-4 h-4" />}
          tone="rose"
        />
        <StatCard
          label="Remaining Budget"
          value={`Rs. ${remaining.toFixed(0)}`}
          icon={<TrendingUp className="w-4 h-4" />}
          tone="emerald"
        />
      </div>

      {/* Daily limit banner */}
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50 border border-emerald-100 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Suggested Daily Spending Limit</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              Rs. {dailyLimit.toFixed(0)}<span className="text-sm font-medium text-slate-500"> / day</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Days Left</p>
            <p className="text-lg font-semibold text-slate-700">{daysLeft} days</p>
          </div>
        </div>
      </div>

      {/* Add spending form */}
      <form onSubmit={handleAdd} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (Rs.)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={spentOn}
              onChange={(e) => setSpentOn(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Roll paratha, chai"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {saving ? 'Saving…' : 'Log Spending'}
        </button>
      </form>

      {/* Recent logs */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Spending</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No spending logged yet.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">Rs. {Number(l.amount).toFixed(0)}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {l.spent_on}{l.note ? ` · ${l.note}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'slate' | 'rose' | 'emerald';
}) {
  const tones = {
    slate: 'bg-slate-50 text-slate-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-7 h-7 rounded-md flex items-center justify-center ${tones[tone]}`}>{icon}</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
