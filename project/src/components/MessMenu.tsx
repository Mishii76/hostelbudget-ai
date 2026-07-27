import { UtensilsCrossed, Check } from 'lucide-react';
import { DIETARY_OPTIONS, type DietaryOption } from '@/lib/supabase';

interface Props {
  messMenu: string;
  dietaryPreferences: string[];
  onMenuChange: (v: string) => void;
  onMenuBlur: () => void;
  onPrefToggle: (pref: string) => void;
}

export default function MessMenu({ messMenu, dietaryPreferences, onMenuChange, onMenuBlur, onPrefToggle }: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Hostel Mess Menu</h2>
      </div>

      <label className="block text-xs font-medium text-slate-500 mb-1.5">
        Paste or type your weekly mess menu
      </label>
      <textarea
        value={messMenu}
        onChange={(e) => onMenuChange(e.target.value)}
        onBlur={onMenuBlur}
        rows={12}
        placeholder="MONDAY&#10;Breakfast: Aloo Anda, Paratha, Chai&#10;Lunch: Daal Chawal, Raita&#10;Dinner: Chicken Karahi, Roti&#10;&#10;TUESDAY&#10;..."
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
      />
      <p className="text-xs text-slate-400 mt-1.5">
        Tip: structure each day with a header (e.g. MONDAY) followed by meals. The AI reads this to find low-value days.
      </p>

      <div className="mt-5">
        <p className="text-xs font-medium text-slate-500 mb-2.5 uppercase tracking-wide">Dietary Preferences</p>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt: DietaryOption) => {
            const active = dietaryPreferences.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onPrefToggle(opt)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5" />}
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
