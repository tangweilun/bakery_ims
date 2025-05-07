# BakeryTrack

<div align="center">
  <img src="https://github.com/user-attachments/assets/a76b9649-711c-410a-9a70-01184ac8b011" alt="BakeryTrack Logo" width="150"/>
  
  **[GitHub Repository](https://github.com/tangweilun/bakery_ims.git) | [Live Demo](https://heroic-tarsier-db5266.netlify.app/)**
</div>

## Overview

BakeryTrack is a comprehensive web application designed to streamline bakery operations through efficient inventory management, production planning, sales tracking, and intelligent demand forecasting. Built with modern web technologies, BakeryTrack helps bakeries minimize waste, optimize stock levels, and improve overall efficiency.

## Screenshots

![image](https://github.com/user-attachments/assets/8f1b99c7-ee0d-421a-9beb-88f64b786de0)
![image](https://github.com/user-attachments/assets/4c504b08-ce18-4816-a1c1-c2929d5e7f4e)
![image](https://github.com/user-attachments/assets/4b2bfe92-46d7-4991-8d57-d7efd1295b99)
![image](https://github.com/user-attachments/assets/27395de3-2558-420d-a207-c0e702edb4b7)
![image](https://github.com/user-attachments/assets/6d3e43cd-f116-42ae-afe6-915a81364b02)
![image](https://github.com/user-attachments/assets/322321a3-e2f1-4eb2-910b-24be8b6c6e87)
![image](https://github.com/user-attachments/assets/c29106d6-7730-4702-b8f2-2e04bedc11a1)
![image](https://github.com/user-attachments/assets/22c0cc1d-cc18-43c5-812a-b5b77ad91c78)
![image](https://github.com/user-attachments/assets/4358158c-5a3b-4228-89ad-7b1f0edb1856)
![image](https://github.com/user-attachments/assets/81ba5571-0618-4c03-b021-7855a8bd2852)
![image](https://github.com/user-attachments/assets/48ee9511-75ff-46da-b63f-5e8f670f754f)
![image](https://github.com/user-attachments/assets/21bfcbbb-c35e-499b-b194-0103a6bcf24a)
![image](https://github.com/user-attachments/assets/8334c569-9ff5-45cb-a284-a29a392ec848)
![image](https://github.com/user-attachments/assets/f36e8ae5-0b31-476a-a8fb-aa5de8083f00)
![image](https://github.com/user-attachments/assets/0ae7477c-6641-40db-a1fe-24e9dc163379)
![image](https://github.com/user-attachments/assets/74200231-b1a0-476f-8430-6e8696c4d929)
![image](https://github.com/user-attachments/assets/09b1156c-aa78-4ec8-9d94-3f25122d4aa3)
![image](https://github.com/user-attachments/assets/c596ab09-1c41-4f59-8602-2c10702b9541)

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Development](#development)
- [Project Structure](#project-structure)

## Key Features

### 🍞 Ingredient Management
- Track detailed information for each ingredient (name, description, category, unit, cost)
- Manage supplier information and link ingredients to suppliers
- Set minimum and ideal stock levels for automated alerts and optimized ordering
- View current stock levels calculated from non-expired batches
- Mark ingredients as active or inactive

### 📦 Batch Tracking (FIFO & Expiry)
- Record incoming ingredient batches with quantity, purchase date, and expiry date
- Automatically calculate remaining quantity based on usage
- Support First-In, First-Out (FIFO) logic for usage recommendations
- Dashboard highlights batches nearing expiry
- View detailed usage history for each batch

### 🍰 Recipe Management
- Create and manage detailed recipes, including ingredients, quantities, preparation steps, baking time, and yield
- Define selling prices for finished products
- Easily view ingredients required for any recipe

### 📈 Sales Tracking & Analytics
- Record sales transactions, linking sold items to specific recipes
- Track sales date, time, day of the week, quantities, and total amount
- Provides historical sales data crucial for forecasting

### 🧠 Demand Forecasting (TensorFlow.js Model)
- Predict future demand for specific recipes based on historical sales data
- Utilizes a **Dense Neural Network** model implemented with **TensorFlow.js** for time-series prediction
- Generates forecasts for a defined period (e.g., the next 7 days)
- Visualizes predicted vs. actual sales data using charts
- Allows saving generated forecasts for future reference

### 📊 Ingredient Requirements Calculation
- Automatically calculates the total quantity of each ingredient needed based on demand forecasts
- Compares required amounts with current stock levels to identify potential shortages
- Visualizes requirements vs. stock using charts

### 📉 Yield Management & Waste Tracking
- Record ingredient usage during production, specifying reasons like production, spoilage, or waste
- Updates ingredient batch quantities automatically
- Helps identify areas of high wastage

### 🔒 User Authentication
- Secure user sign-up, sign-in, and password management powered by **Supabase Auth**
- Handles email confirmation and password resets

### 📜 Activity Logging
- Records key user actions for audit trails
- Tracks system changes for accountability

### 🖥️ Dashboard Overview
- Provides a quick summary of recent activities and ingredients nearing expiry
- Visual representations of key metrics and alerts

## Technology Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | Supabase |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Charting** | Chart.js, Recharts |
| **State Management** | React Hooks (useState, useEffect) |
| **Machine Learning** | TensorFlow.js |
| **Deployment** | Netlify |

</div>

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase account (for auth)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/tangweilun/bakery_ims.git
   cd bakery-web-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

   > **Note:** Ensure you run `npm install` (or `yarn install`) to download all necessary project dependencies before proceeding.

### Environment Setup

Create a `.env.local` file in the root directory and add the following variables:

```env
# Database URLs (Prisma)
# Use connection pooling for serverless environments if applicable
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
# Direct URL is needed for migrations/introspection
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Optional: Supabase Service Role Key (if needed for server-side admin tasks, keep secure)
# SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

### Development

1. **Apply Prisma Migrations:**

   This command will synchronize your database schema with the `prisma/schema.prisma` file.

   ```bash
   npx prisma migrate dev --name init
   ```

   > _(You might need a different migration name if `init` already exists)_

2. **(Optional) Seed the database:**

   If you want to populate the database with initial sample data:

   ```bash
   npx prisma db seed
   ```

   > _(Requires the `prisma/seed.ts` file and `ts-node` to be configured in `package.json`)_

3. **Running the Application:**

   For Development:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open your browser and navigate to `http://localhost:3000`.

   For Production:

   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

## Project Structure

```
bakery-ims/
├── app/                    # Next.js App Router structure
│   ├── api/                # API routes 
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Main application pages
│   │   ├── ingredients/    # Ingredient management
│   │   ├── batches/        # Batch tracking
│   │   ├── recipes/        # Recipe management
│   │   ├── sales/          # Sales tracking
│   │   ├── forecasting/    # Demand forecasting
│   │   └── reports/        # Reports and analytics
│   └── layout.tsx          # Root layout component
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components
│   ├── forms/              # Form components
│   └── charts/             # Chart components
├── lib/                    # Utility functions and shared logic
│   ├── supabase/           # Supabase client configuration
│   ├── prisma/             # Prisma client configuration
│   └── ml/                 # TensorFlow.js model implementations
├── prisma/                 # Prisma ORM files
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding script
├── public/                 # Static assets
└── package.json            # Project dependencies and scripts
```

---

<div align="center">
  <p>Developed with ❤️ for bakeries worldwide</p>
  <p>© 2023-2025 BakeryTrack Team</p>
</div>
