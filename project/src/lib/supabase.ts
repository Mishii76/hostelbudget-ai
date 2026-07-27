import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BudgetState {
  id: number;
  monthly_allowance: number;
  mess_fee: number;
  dietary_preferences: string[];
  mess_menu: string;
  updated_at: string;
}

export interface SpendingLog {
  id: string;
  amount: number;
  spent_on: string;
  note: string;
  created_at: string;
}

export const DIETARY_OPTIONS = ['Vegetarian', 'High Protein', 'Budget-Saver', 'Low Carb', 'Gluten-Free'] as const;
export type DietaryOption = typeof DIETARY_OPTIONS[number];
