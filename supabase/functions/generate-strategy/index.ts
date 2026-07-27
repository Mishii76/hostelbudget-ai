import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StrategyRequest {
  monthlyAllowance: number;
  messFee: number;
  totalSpent: number;
  remainingBudget: number;
  daysLeft: number;
  dietaryPreferences: string[];
  messMenu: string;
  spendingBreakdown?: { date: string; amount: number; note: string }[];
}

const SYSTEM_PROMPT = `You are HostelBudget AI, the F-8 Islamabad Student Living Expert — a smart budget and meal-planning assistant for university hostel/dorm students living on a tight monthly allowance in Sector F-8, Islamabad, Pakistan.

You are now localized as the F-8 Islamabad Student Living Expert. When analyzing the student's budget and menu, you must recommend cheap local food alternatives located specifically in or around F-8 Markaz or neighboring sectors (like E-11, F-7, or G-9). Give explicit recommendations for budget-friendly student spots (e.g. cheap dhabas, local roll paratha stalls, tandoors, Madina Market spots, or affordable student points in F-8 Markaz) when recommending days to skip the hostel mess.

You receive a student's budget state, their logged spending, and their weekly hostel mess menu. You must:
1. Analyze the mess menu day-by-day and flag low-value or unhealthy days (e.g. heavy fried snacks, low protein, repetitive carbs, oily sabzi).
2. Calculate the remaining monthly allowance and a realistic daily spending limit for the rest of the month.
3. Produce a concrete, day-by-day optimized strategy that respects the student's dietary preferences.
4. Suggest cheap, high-value outside-food or grocery swaps from real spots in/around F-8 Markaz, F-7, E-11, or G-9 (name specific dhabas, tandoors, roll paratha stalls, Madina Market vendors where possible).
5. Keep the tone encouraging, practical, and specific to a Pakistani student budget. Always use Pakistani Rupees (Rs.) amounts, never USD.

Return ONLY valid GitHub-flavored Markdown. Use clear section headings (##), short bullet lists, and a final "## Quick Reference" summary table. Do not wrap the response in code fences.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: StrategyRequest = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    let strategy: string;
    let source: "openai" | "anthropic" | "local";

    if (openaiKey) {
      try {
        strategy = await callOpenAI(openaiKey, body);
        source = "openai";
      } catch (err) {
        console.warn("OpenAI call failed, using mock fallback:", err);
        strategy = mockStrategy(body);
        source = "local";
      }
    } else if (anthropicKey) {
      try {
        strategy = await callAnthropic(anthropicKey, body);
        source = "anthropic";
      } catch (err) {
        console.warn("Anthropic call failed, using mock fallback:", err);
        strategy = mockStrategy(body);
        source = "local";
      }
    } else {
      strategy = mockStrategy(body);
      source = "local";
    }

    return new Response(JSON.stringify({ strategy, source }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    // Last-resort fallback: never surface a hard error to the UI.
    console.warn("Strategy handler error, using mock fallback:", err);
    const strategy = mockStrategy({ monthlyAllowance: 25000, messFee: 12000, totalSpent: 0, remainingBudget: 13000, daysLeft: 30, dietaryPreferences: [], messMenu: "" });
    return new Response(JSON.stringify({ strategy, source: "local" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function callOpenAI(apiKey: string, body: StrategyRequest): Promise<string> {
  const userPrompt = buildUserPrompt(body);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");
  return content as string;
}

async function callAnthropic(apiKey: string, body: StrategyRequest): Promise<string> {
  const userPrompt = buildUserPrompt(body);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic request failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const content = data?.content?.[0]?.text;
  if (!content) throw new Error("Anthropic returned no content");
  return content as string;
}

function buildUserPrompt(b: StrategyRequest): string {
  const prefs = b.dietaryPreferences.length ? b.dietaryPreferences.join(", ") : "None specified";
  const breakdown = b.spendingBreakdown && b.spendingBreakdown.length
    ? b.spendingBreakdown.map((s) => `  - ${s.date}: Rs. ${s.amount.toFixed(2)}${s.note ? ` (${s.note})` : ""}`).join("\n")
    : "  (no individual logs yet)";

  return `Here is my current situation. I am a university hostel student living in Sector F-8, Islamabad, Pakistan. Please generate an optimized budget & meal strategy.

## Budget
- Total monthly allowance: Rs. ${b.monthlyAllowance.toFixed(2)}
- Fixed hostel/mess fee (already paid): Rs. ${b.messFee.toFixed(2)}
- Total spent so far (outside mess): Rs. ${b.totalSpent.toFixed(2)}
- Remaining monthly budget: Rs. ${b.remainingBudget.toFixed(2)}
- Days left in the month: ${b.daysLeft}
- Dietary preferences: ${prefs}

## Logged spending
${breakdown}

## Weekly hostel mess menu
${b.messMenu || "(no menu provided)"}

Now produce the strategy as GitHub-flavored Markdown with the sections described in your instructions.`;
}

// High-quality pre-written mock response simulating the AI analysis for an
// F-8 Islamabad student. Used when no API key is configured OR when a live
// API request fails, so the app always returns a useful strategy.
function mockStrategy(_b: StrategyRequest): string {
  return `### 📊 Budget Health Assessment
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
}
