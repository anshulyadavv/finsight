# FinIQ Backend — Personal Finance Intelligence Platform

Production-ready backend for the FinIQ fintech dashboard.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Nginx (Port 80/443)                     │
│                    Rate limiting · TLS · Proxy                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │      NestJS API  :3001       │
              │  ┌──────────────────────┐   │
              │  │  Auth Module (JWT)   │   │
              │  │  Transactions Module │   │
              │  │  Dashboard Service   │   │
              │  │  Insights Engine     │   │
              │  │  Anomaly Service     │   │
              │  │  Predictions Service │   │
              │  │  Budgets Module      │   │
              │  │  Notifications Svc   │   │
              │  │  Categorization Eng  │   │
              │  └──────────────────────┘   │
              └───┬──────────┬──────────────┘
                  │          │
     ┌────────────▼──┐  ┌───▼──────────────┐
     │  PostgreSQL   │  │  Redis + BullMQ   │
     │  :5432        │  │  :6379            │
     │  ─────────    │  │  ─────────────    │
     │  users        │  │  Dashboard cache  │
     │  transactions │  │  Insights queue   │
     │  categories   │  │  Anomaly queue    │
     │  budgets      │  │  ML training q    │
     │  insights     │  └──────────────────┘
     │  anomalies    │
     └───────────────┘
                  │
     ┌────────────▼──────────────────┐
     │   Python ML Service  :8000    │
     │   ──────────────────────────  │
     │   POST /categorize            │
     │     TF-IDF + LightGBM         │
     │                               │
     │   POST /detect-anomaly        │
     │     Isolation Forest          │
     │                               │
     │   POST /predict               │
     │     Prophet → ARIMA → WMA     │
     └───────────────────────────────┘
```

## Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker + Docker Compose
- Python 3.11+ (for local ML dev)

### 2. Clone & configure
```bash
git clone https://github.com/your-org/finiq-backend.git
cd finiq-backend

cp .env.example .env
# Edit .env — set JWT secrets, SMTP, VAPID keys
```

### 3. Start all services
```bash
docker-compose up -d
```

### 4. API is live at
- REST API:    http://localhost:3001/api/v1
- Swagger UI:  http://localhost:3001/api/docs
- ML Service:  http://localhost:8000/docs
- Bull Board:  http://localhost:3002  (dev profile only)

### 5. Run locally (without Docker)
```bash
# Start Postgres + Redis via Docker only
docker-compose up -d postgres redis

# Install API deps
cd apps/api && npm install

# Run in dev mode
npm run start:dev

# In another terminal — start ML service
cd apps/ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## API Reference

### Auth
| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| POST   | /api/v1/auth/register       | Register new user            |
| POST   | /api/v1/auth/login          | Login → JWT tokens           |
| POST   | /api/v1/auth/refresh        | Refresh access token         |
| POST   | /api/v1/auth/logout         | Invalidate refresh token     |
| GET    | /api/v1/auth/me             | Current user profile         |
| PATCH  | /api/v1/auth/change-password| Change password              |

### Transactions
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/v1/transactions              | List (paginated, filtered)|
| POST   | /api/v1/transactions              | Create transaction        |
| PATCH  | /api/v1/transactions/:id          | Update / correct category |
| DELETE | /api/v1/transactions/:id          | Delete                    |
| POST   | /api/v1/transactions/bulk-upload  | CSV bulk import           |
| POST   | /api/v1/transactions/parse-sms    | Parse Indian bank SMS     |

### Dashboard
| Method | Endpoint                       | Powers UI Card              |
|--------|--------------------------------|-----------------------------|
| GET    | /api/v1/dashboard/summary      | Income · Expenses · Savings |
| GET    | /api/v1/dashboard/overview     | Donut chart categories      |
| GET    | /api/v1/dashboard/money-flow   | Line chart (6 months)       |
| GET    | /api/v1/dashboard/wealth       | Account balances            |

### Intelligence
| Method | Endpoint                   | Description                  |
|--------|----------------------------|------------------------------|
| GET    | /api/v1/insights           | AI-generated insights        |
| PATCH  | /api/v1/insights/:id/read  | Mark read                    |
| PATCH  | /api/v1/insights/:id/dismiss| Dismiss                     |
| GET    | /api/v1/anomalies          | Unresolved anomaly alerts    |
| PATCH  | /api/v1/anomalies/:id/resolve| Resolve anomaly            |
| GET    | /api/v1/predictions        | Monthly spending forecast    |

### Budgets
| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | /api/v1/budgets      | List budgets with % usage    |
| POST   | /api/v1/budgets      | Create category budget       |
| PATCH  | /api/v1/budgets/:id  | Update limit / alert %       |
| DELETE | /api/v1/budgets/:id  | Delete budget                |

---

## Background Jobs (BullMQ)

| Queue      | Job          | Trigger                         | Action                           |
|------------|--------------|----------------------------------|----------------------------------|
| `insights` | `generate`   | After any transaction create/delete | Run rule engine + ML insights |
| `insights` | `train`      | After user corrects category     | Send correction to ML service    |
| `anomalies`| `detect`     | After every expense transaction  | Z-score + Isolation Forest       |

---

## ML Service Endpoints

```bash
# Categorize
curl -X POST http://localhost:8000/categorize \
  -H "X-API-Key: ml-internal-key" \
  -H "Content-Type: application/json" \
  -d '{"description": "Swiggy order biryani"}'
# → {"category": "Food", "confidence": 0.91, "method": "rule"}

# Anomaly detection
curl -X POST http://localhost:8000/detect-anomaly \
  -H "X-API-Key: ml-internal-key" \
  -d '{"user_id":"abc","amount":85000,"category":"Shopping","day_of_week":6}'
# → {"is_anomaly": true, "anomaly_score": 0.87, "method": "statistical_fallback"}

# Predict
curl -X POST http://localhost:8000/predict \
  -H "X-API-Key: ml-internal-key" \
  -d '{"transactions": [...]}'
# → {"projectedExpense": 42000, "projectedIncome": 95000, ...}
```

---

## Database Schema

```sql
users          (id, name, email, password_hash, refresh_token, ...)
transactions   (id, user_id, amount, category_id, merchant, type, date, payment_method, ...)
categories     (id, name, icon, color, is_system)
budgets        (id, user_id, category_id, limit, month, alert_at_percent)
insights       (id, user_id, type, severity, message, impact, actionable, data, is_read)
anomalies      (id, user_id, transaction_id, type, message, anomaly_score, z_score, is_resolved)
```

---

## Security

- JWT access tokens (15 min) + refresh tokens (7 days, hashed with bcrypt)
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting: 10 req/s (short), 200/min (long), 10/min on auth endpoints
- Input validation via class-validator on all DTOs
- Nginx security headers: HSTS, X-Frame-Options, CSP

---

## Performance

- Redis cache on all dashboard endpoints (2 min TTL)
- Redis cache on ML categorization results (24h TTL)
- Paginated transaction queries with indexes on (user_id, date)
- Background jobs via BullMQ — no blocking in request path
- PostgreSQL `pg_trgm` for fast ILIKE text search

---

## Deployment (AWS/GCP)

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Push to ECR / Artifact Registry
docker tag finiq_api:latest <ECR_REPO>/finiq-api:latest
docker push <ECR_REPO>/finiq-api:latest

# Deploy with ECS / Cloud Run / K8s
# Use docker-compose.yml as base for K8s manifests via kompose
kompose convert -f docker-compose.yml
```

---

## Generating VAPID Keys for Push Notifications

```bash
npx web-push generate-vapid-keys
# Copy VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to .env
```
