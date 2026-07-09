# B2B Stationery Order Management System

A production-ready, monorepo-based B2B Order Management System built for a stationery wholesaler.

The system is separated into a shared Express backend, a React web portal for B2B customers, and a React + Electron desktop application for shop administrators.

## Features

- **Admin Desktop Application (Electron + React)**: Manage products, categories, B2B customers, pricing, and orders natively on your desktop.
- **Customer Web Portal (React + Vite)**: A dedicated B2B portal where logged-in customers can browse products at their **exclusive custom prices**, place orders, and track order history.
- **Custom Pricing Engine**: The admin can assign unique product pricing to individual customers. Customers never see the base price or another customer's price.
- **Email Notifications**: Automated HTML emails via Nodemailer when orders are placed.
- **Shared Monorepo**: Uses `npm` workspaces and `Turborepo` to share TypeScript types, configurations, and scripts across all apps.
- **PostgreSQL + Prisma**: A fully normalized and relational database schema.

## Tech Stack

- **Monorepo**: npm workspaces, Turborepo
- **Backend**: Node.js, Express, Prisma (PostgreSQL), JWT, bcryptjs, Nodemailer
- **Admin App**: Electron, React, Vite, Tailwind CSS, Zustand, TanStack Query, Recharts
- **Customer App**: React, Vite, Tailwind CSS, Zustand, TanStack Query
- **Shared**: `@stationery-oms/types`, TypeScript configs

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL running locally or in Docker

### 1. Installation

Clone the repository and install dependencies at the root level:

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database and copy the environment template:

```bash
cp .env.example .env
```

Update your `.env` file with your PostgreSQL connection string and a secret key:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/stationery_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
# Add your SMTP credentials for Nodemailer here
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your-user"
SMTP_PASS="your-pass"
SMTP_FROM="orders@stationery.com"
```

Run migrations and seed the database with initial dummy data:

```bash
npm run db:setup
```

*(The seed script will create an admin user `admin@stationery.com` (password: `admin123`) and a sample customer `john@acmecorp.com` (password: `password123`).)*

### 3. Running the Development Servers

You can start the backend and frontend servers simultaneously using Turborepo from the root directory:

```bash
npm run dev
```

Alternatively, you can run apps individually:

- **Backend API**: `cd apps/server && npm run dev`
- **Customer Website**: `cd apps/customer-website && npm run dev`
- **Admin Desktop App**: `cd apps/admin-desktop && npm run dev`

### Project Structure

```text
├── apps/
│   ├── admin-desktop/       # Electron + React Admin app
│   ├── customer-website/    # React + Vite Customer app
│   └── server/              # Express API Backend
├── packages/
│   ├── config-typescript/   # Shared tsconfig bases
│   └── types/               # Shared TypeScript domain models/DTOs
├── package.json
└── turbo.json
```
