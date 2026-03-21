# FinSight — Frontend

Premium personal finance intelligence dashboard built with Next.js 14, Tailwind CSS, Framer Motion, and Recharts.
Connects to the FinIQ backend API.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — utility styling
- **Framer Motion** — animations
- **Recharts** — charts (area, bar, donut, line)
- **Axios** — API client with auto token refresh

## Pages
| Route        | Description                        |
|--------------|------------------------------------|
| `/`          | Redirects to `/dashboard`          |
| `/login`     | JWT login form                     |
| `/register`  | New account registration           |
| `/dashboard` | Main finance intelligence dashboard|

## Dashboard Cards (all live data)
- **Income Card** — monthly income + sparkline trend
- **Expense Strategy** — budget vs actual bar chart
- **Overview** — donut chart with category breakdown
- **Money Flow** — 6-month income vs expenses area chart
- **My Finances** — bank card UI with user name
- **Wealth Breakdown** — account balances from API
- **Insights** — AI-generated actionable insights (dismissable)
- **Anomaly Alert** — unusual transaction detection (resolvable)
- **Prediction** — next month spending forecast with progress bar

## Quick Start

### Prerequisites
- Node.js 20+
- FinIQ backend running on `http://localhost:3001`

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open **http://localhost:3000**

### Environment
The `.env.local` file points to your local backend:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Change this to your deployed backend URL when deploying.

## Project Structure
```
src/
├── app/
│   ├── dashboard/page.tsx   # Main dashboard
│   ├── login/page.tsx       # Login
│   ├── register/page.tsx    # Register
│   ├── layout.tsx           # Root layout + AuthProvider
│   └── globals.css          # Global styles + CSS variables
├── components/
│   ├── layout/Navbar.tsx    # Top navigation bar
│   └── dashboard/
│       ├── Cards.tsx        # All dashboard card components
│       └── AddExpenseModal  # Add transaction modal
├── hooks/
│   ├── useAuth.tsx          # Auth context + login/logout
│   └── useDashboard.ts      # Dashboard data fetching hook
└── lib/
    └── api.ts               # Axios client + all API functions
```
