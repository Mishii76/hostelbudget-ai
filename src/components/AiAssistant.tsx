import { Sparkles, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { generateStrategy, type StrategyInput } from '@/lib/api';
import { renderMarkdown } from '@/lib/markdown';

interface Props {
  input: Omit<StrategyInput, 'spendingBreakdown'>;
  spendingBreakdown: { date: string; amount: number; note: string }[];
}

export default function AiAssistant({ input, spendingBreakdown }: Props) {
  const [strategy, setStrategy] = useState<string | null>(null);
  const [source, setSource] = useState<'openai' | 'anthropic' | 'local' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setStrategy(null);
    try {
      const result = await generateStrategy({ ...input, spendingBreakdown });
      setStrategy(result.strategy);
      setSource(result.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while generating the strategy.');
    } finally {
      setLoading(false);
    }
  }

  const sourceLabel = source === 'openai' ? 'GPT-4o-mini' : source === 'anthropic' ? 'Claude 3.5 Sonnet' : 'Local heuristic';

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-5 sm:p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold">AI Living Assistant</h2>
          <p className="text-xs text-slate-400">Analyzes your budget & mess menu, then builds a personalized strategy.</p>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold px-5 py-3.5 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:translate-y-0"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
        {loading ? 'Generating your strategy…' : 'Generate Optimized Budget & Meal Strategy'}
      </button>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-500/15 border border-rose-500/30 px-3.5 py-3 text-sm text-rose-200">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {strategy && (
        <div className="mt-5 rounded-xl bg-white p-5 sm:p-6 max-h-[600px] overflow-y-auto">
          {source && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <Sparkles className="w-3 h-3" />
              Powered by {sourceLabel}
            </div>
          )}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(strategy) }}
          />
        </div>
      )}
    </section>
  );
}
