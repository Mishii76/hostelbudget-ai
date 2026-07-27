import { Building2 } from 'lucide-react';

export interface HostelEntry {
  name: string;
  rent: number;
  menu: string;
}

export const hostelData: Record<string, HostelEntry> = {
  nazzal: {
    name: 'Nazzal Girls Hostel (F-8/1)',
    rent: 25500,
    menu: 'MONDAY:\nBreakfast: Aloo Anda, Paratha, Chai\nLunch: Daal Chawal, Raita, Salad\nDinner: Chicken Karahi, Roti\nTUESDAY:\nBreakfast: Chana Daal, Roti, Chai\nLunch: Sabzi, Chawal\nDinner: Aloo Qeema, Roti, Kheer',
  },
  al_aqsa: {
    name: 'Al Aqsa Girls Hostel (F-8/2)',
    rent: 24500,
    menu: 'MONDAY:\nBreakfast: Boiled Egg, Bread, Tea\nLunch: Aloo Gobi, Roti\nDinner: Chicken Pulao, Raita, Salad\nTUESDAY:\nBreakfast: Lahori Chana, Paratha, Tea\nLunch: Mong Daal, Chawal\nDinner: Mix Sabzi, Roti',
  },
  noor: {
    name: 'Noor Girls Hostel (F-8/1)',
    rent: 25500,
    menu: 'MONDAY:\nBreakfast: Omelette, Paratha, Chai\nLunch: Kari Pakora, Chawal\nDinner: Chicken Haleem, Roti\nTUESDAY:\nBreakfast: Fried Egg, Bread, Tea\nLunch: Alloo Matar, Roti\nDinner: Chicken Biryani, Raita',
  },
  four_seasons: {
    name: 'Four Seasons Girls Hostel (F-8/2)',
    rent: 27000,
    menu: 'MONDAY:\nBreakfast: French Toast, Halwa Puri, Chai\nLunch: Daal Mash, Roti\nDinner: Premium Chicken White Karahi, Naan\nTUESDAY:\nBreakfast: Eggs to order, Paratha, Tea\nLunch: Seasonal Vegetable, Chawal\nDinner: Beef Shami, Daal, Roti',
  },
  musarrat: {
    name: 'Musarrat Girls Hostel (F-8)',
    rent: 26000,
    menu: 'MONDAY:\nBreakfast: Aloo Paratha, Dahi, Tea\nLunch: Vegetable Rice, Raita\nDinner: Chicken Jalfrezi, Roti\nTUESDAY:\nBreakfast: Omelette, Toast, Chai\nLunch: Lobia Salan, Roti\nDinner: Chicken Kofta, Roti, Halwa',
  },
};

interface Props {
  selected: string;
  onSelect: (key: string, rent: number, menu: string) => void;
}

export default function HostelSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Your Hostel</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Building2 className="w-4 h-4 text-slate-400" />
        </span>
        <select
          value={selected}
          onChange={(e) => {
            const key = e.target.value;
            if (key && hostelData[key]) {
              onSelect(key, hostelData[key].rent, hostelData[key].menu);
            }
          }}
          className="w-full appearance-none rounded-lg border border-slate-200 pl-9 pr-8 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">— Choose your hostel —</option>
          {Object.entries(hostelData).map(([key, h]) => (
            <option key={key} value={key}>
              {h.name} · Rs. {h.rent.toLocaleString()}/mo
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</span>
      </div>
    </div>
  );
}
