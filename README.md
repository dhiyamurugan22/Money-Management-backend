# Money Tracker — Backend

The backend for the Money Tracker mobile application, responsible for processing income and expense transactions, automatically categorizing transactions, and providing monthly financial analysis.

## Overview

The Money Tracker backend provides APIs that connect the mobile frontend with the database. It handles transaction processing, automatic categorization, and the retrieval of financial data for monthly analysis.

## Responsibilities

- **Income Management:** Process and store income transactions.
- **Expense Management:** Process and store expense transactions.
- **Automatic Categorization:** Categorize transactions based on their descriptions without requiring users to select categories manually.
- **Monthly Analysis:** Calculate income and expenses for a selected month.
- **Spending Analysis:** Identify spending patterns across automatically assigned categories.
- **Transaction Retrieval:** Retrieve the user's transactions and financial records for the requested period.
- **Authentication and Data Security:** Integrate with Supabase Auth and enforce appropriate access controls.

## Technology Stack

- **Node.js** — JavaScript runtime
- **Express.js** — Backend API framework
- **TypeScript** — Type-safe development
- **Supabase** — Database and authentication services
- **PostgreSQL** — Relational database

## Repository Structure

This repository contains the backend application. The mobile frontend is maintained separately in `money-tracker-frontend`.

```text
money-tracker-backend/
├── src/
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── types/
│   └── app.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

*This is the planned folder structure and may change during development.*

## Getting Started

### Prerequisites

- Node.js (LTS version)
- npm
- A Supabase project

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate into the project directory:

   ```bash
   cd money-tracker-backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file using `.env.example` as a reference and configure the required environment variables.

5. Start the development server using the script configured in `package.json`.

   ```bash
   npm run dev
   ```

*The available scripts and environment variables will be finalized during implementation.*

## API Responsibilities

The backend will expose APIs for:

- Recording income transactions.
- Recording expense transactions.
- Retrieving transaction records.
- Retrieving monthly income and expense summaries.
- Retrieving category-based spending analysis.

The frontend will consume these APIs to display transaction records and financial analysis.

## Database

Supabase PostgreSQL will store the application's financial data.

Supabase Auth will handle user authentication. Appropriate access controls and Row Level Security (RLS) policies will be used to protect users' financial records.

## Automatic Categorization

Transactions will be categorized automatically using their descriptions and transaction information.

Users will not be required to manually select or assign categories.

These categories will support monthly spending analysis.

## Project Goals

- Provide reliable APIs for the mobile application.
- Keep income and expense records organized.
- Support automatic transaction categorization.
- Generate accurate monthly financial summaries.
- Protect users' financial data.

## License

No license has been specified yet.
