# FinSight

FinSight is a production-grade, AI-powered personal finance intelligence platform. Designed as a comprehensive full-stack ecosystem, FinSight empowers users to track transactions, predict spending trends, and detect financial anomalies using advanced machine learning models. 

Built with scalability, performance, and developer experience in mind, the platform features a microservices architecture orchestrating a NestJS API server, a Python FastAPI machine learning service, and a highly responsive Next.js frontend.

## Key Features

### Intelligence & Machine Learning
*   **Algorithmic Categorization Engine**: A hybrid transaction categorization system utilizing TF-IDF and LightGBM models with keyword rule-based fallbacks. It automatically processes and tags imported bank transactions with high accuracy.
*   **Predictive Financial Forecasting**: Employs Prophet, ARIMA, and weighted moving average algorithms to generate precise projections for future expenses, income trends, and savings rates.
*   **Behavioral Anomaly Detection**: Integrates Z-score statistical methods and Isolation Forest ML models to flag duplicate charges, abnormal spending spikes, and potential unused subscriptions.

### Comprehensive Financial Management
*   **Dynamic Dashboard Analytics**: Real-time aggregation of income, expenses, and savings, powered by Redis-cached endpoints for immediate load times. Includes comprehensive visualizations such as money flow area charts and categorical donut charts.
*   **Transaction Processing**: Full CRUD capabilities with support for bulk CSV uploads. Features an intelligent parser for standard banking SMS formats (HDFC, SBI, etc.).
*   **Budgeting & Threshold Alerts**: Granular, per-category monthly budget constraints enriched with real-time usage metrics and proactive expenditure warnings.
*   **Subscription & Card Management**: Track active subscriptions, recurring costs, and manage virtual wallet details with automated expiry validation and secure, masked rendering.

### Platform & Architecture
*   **Robust Security & Authentication**: Implements JWT-based access tokens, encrypted refresh tokens, and bcrypt password hashing (12 rounds). 
*   **Asynchronous Processing**: Leverages BullMQ and Redis for background job execution, ensuring non-blocking operations for intensive tasks such as ML model retraining and insight generation.
*   **Adaptive User Interface**: A modern, glass-morphism inspired UI built with Next.js 14 and Tailwind CSS. Features full light/dark thematic switching driven by CSS variables and highly optimized component hydration.

## System Architecture

FinSight operates on a containerized microservices architecture:

1.  **Frontend Client (Next.js 14)**: Handles user interaction, state management, and real-time chart renderings.
2.  **Core API Gateway (NestJS)**: The central orchestration layer managing authentication, business logic, PostgreSQL database interactions, and Redis caching.
3.  **Machine Learning Service (FastAPI)**: An isolated Python microservice dedicated to running complex NLP and predictive models, communicating securely over internal Docker networks via API keys.
4.  **Data Persistence & Caching**: PostgreSQL 16 operates as the primary relational database, while Redis 7 facilitates sub-millisecond data caching and high-throughput background queues.

## Technology Stack

**Frontend**
*   Next.js 14 (App Router)
*   React 18
*   Tailwind CSS
*   Framer Motion (Animations)

**Backend Core API**
*   NestJS
*   TypeScript
*   TypeORM (PostgreSQL)
*   BullMQ (Redis)
*   Passport.js (JWT Authentication)

**Machine Learning Service**
*   Python 3.10+
*   FastAPI
*   scikit-learn (Isolation Forest)
*   LightGBM
*   Prophet & Statsmodels (ARIMA)

**Infrastructure**
*   Docker & Docker Compose
*   Nginx (Reverse Proxy & Rate Limiting)

## Getting Started

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
*   [Node.js](https://nodejs.org/) v20+ (for local frontend development).
*   Git.

### Installation & Deployment

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your-username/finsight.git
    cd finsight
    ```

2.  **Environment Configuration**
    Copy the example environment configurations and populate the necessary secure keys.
    ```sh
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env.local
    ```
    *Note: Ensure to define strong cryptographic secrets for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `ML_API_KEY`.*

3.  **Start the Services via Docker Compose**
    The provided compose configuration orchestrates the NextJS, NestJS, Postgres, Redis, and FastAPI services simultaneously.
    ```sh
    docker-compose up --build -d
    ```

4.  **Access the Application**
    *   Frontend Client: `http://localhost:3000`
    *   API Backend Server: `http://localhost:3001`
    *   API Swagger Documentation: `http://localhost:3001/api/docs`
    *   ML Service Health Check: `http://localhost:8000/health`

## API Documentation

The core NestJS backend provides exhaustive, self-documenting OpenAPI specifications. Once the API server is operational, navigate to `/api/docs` to interact with all available endpoints, review payload schemas, and manage authentication directly through the browser.

## Roadmap & Future Enhancements

We are continuously iterating to build the ultimate financial intelligence tool. Planned enhancements include:
*   **Bank API Integrations**: Direct synchronization with financial institutions via Plaid or similar data aggregators.
*   **Recurring Transaction Automation**: Rules to automatically generate predefined transactions on schedules.
*   **Custom Financial Goals**: Granular savings targets paired with real-time progression tracking.
*   **Automated PDF Reporting**: Scheduled generation of comprehensive monthly financial statements.

## Contributing

We welcome contributions from the developer community. Please refer to our contribution guidelines before submitting pull requests. Ensure all code modifications adhere to the established TypeScript and Python linting rules.

## License

This project is proprietary. All rights reserved.