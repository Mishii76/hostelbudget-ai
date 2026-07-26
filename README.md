# hostelbudget-ai
# HostelBudget AI — Smart Budget & Meal Planner for F-8 Islamabad Students

An AI-driven financial optimization and meal-tracking assistant built specifically for university students living in hostels within Sector F-8, Islamabad, Pakistan.

Students handle highly constrained monthly allowances and struggle to find a balance between fixed hostel mess halls, outside dining expenses, and healthy nutritional guidelines. This application helps students optimize their financial resources locally.

---

## 🚀 Live Production Link
* **LIVE DEPLOYED URL:** https://hostelbudget-ai-app-1ahf.bolt.host

---

## ✨ System Features
* **Hostel Dropdown Matrix:** Built-in profiles for prominent local spots including Nazzal, Al Aqsa, Noor, Four Seasons, Musarrat, and Dar Ul Haya Girls Hostels.
* **PKR Currency Integration:** Calculation templates tailored entirely to Pakistani Student expenditure scales (Rs.).
* **Smart Budget Tracker:** Dynamically adjusts and monitors Total Monthly Allowance, Fixed Hostel/Mess Fees, and daily spending to produce a live "Suggested Daily Spending Limit".
* **Hostel Mess Menu Analysis:** A rich UI layout allowing students to view weekly mess hall schedules dynamically mapped to their selected facility.
* **F-8 Sector Localization:** Recommends targeted, hyper-local budget adjustments referencing well-known student food hubs around F-8 Markaz, F-7, and G-9 sectors.

---
---

## 📸 Application Screenshots

### 1. Main Dashboard & Budget Calculator
[Drag & drop your 1st screenshot file here]

### 2. AI Financial & Mess Optimization Output
[Drag & drop your 2nd screenshot file here]

### 3. Live Application in Action
[Drag & drop your 3rd screenshot file here]

## 🧠 The AI Feature & Core System Prompt
The core feature of this platform leverages an LLM framework configured with defensive local fallback routing to maintain zero downtime even if production edge secrets are missing. 

### Core AI System Prompt Used:
```text
You are now localized as the F-8 Islamabad Student Living Expert. Your job is to analyze a university student's remaining monthly allowance, their dietary preferences, and their weekly hostel mess menu text to maximize their financial savings without sacrificing nutrition.

When analyzing the student's budget and menu, you must recommend cheap local food alternatives located specifically in or around F-8 Markaz or neighboring sectors (like E-11, F-7, or G-9). Give explicit recommendations for budget-friendly student spots (e.g., cheap dhabas, local roll paratha stalls, tandoors, Madina Market spots, or affordable student points in F-8 Markaz) when recommending days to skip the hostel mess.

Provide your final optimization report strictly formatted in clean, highly scannable Markdown with these sections:
1. 📊 Budget Health Assessment
2. 🗓️ Mess Hall Optimization Plan
3. 💡 Cheap Local Upgrades (F-8 Markaz)
4. 🚀 Golden Financial Rule
```

---

## 🛠️ Tools, Services, and AI Models Used
* **Frontend UI & State Management:** React.js, Tailwind CSS, Vite.
* **AI Engine Framework:** OpenAI GPT-4o-mini API / Anthropic API wrappers with local JSON mock fallbacks.
* **App Generation Environment:** Bolt.new development engine.
* **Hosting Platform:** Netlify / Vercel Edge Networks / Bolt Core Host.
