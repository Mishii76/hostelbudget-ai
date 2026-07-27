import { Settings, Save } from 'lucide-react';
import { useState } from 'react';
import HostelSelector from '@/components/HostelSelector';

interface Props {
  monthlyAllowance: number;
  messFee: number;
  selectedHostel: string;
  onSave: (allowance: number, messFee: number) => Promise<void>;
  onHostelSelect: (key: string, rent: number, menu: string) => void;
}

export default function BudgetSettings({ monthlyAllowance, messFee, selectedHostel, onSave, onHostelSelect }: Props) {
  const [allowance, setAllowance] = useState(String(monthlyAllowance));
  const [fee, setFee] = useState(String(messFee));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await onSave(parseFloat(allowance) || 0, parseFloat(fee) || 0);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Budget Setup</h2>
      </div>

      <div className="mb-4">
        <HostelSelector selected={selectedHostel} onSelect={onHostelSelect} />
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Total Monthly Allowance (Rs.)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={allowance}
            onChange={(e) => setAllowance(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Fixed Hostel / Mess Fee (Rs.)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Budget'}
          </button>
        </div>
      </form>
    </section>
  );
}
