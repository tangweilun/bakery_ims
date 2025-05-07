# Bakery Management System

A comprehensive web application for bakery inventory management, production planning, sales tracking, and demand forecasting.

## Overview

This Bakery Management System is designed to help bakery businesses efficiently manage their ingredients, recipes, production, and sales. It includes features for inventory tracking, demand forecasting, recipe management, and analytics dashboards to optimize operations and reduce waste.

## Features

- **Ingredient Management**

  - Track inventory levels, costs, and suppliers
  - Set minimum stock thresholds for automatic alerts
  - Monitor ingredient expiration dates

- **Recipe Management**

  - Create and manage recipes with ingredient quantities
  - Calculate production costs and selling prices
  - Track recipe yields and preparation times

- **Production Planning**

  - Record production batches and ingredient usage
  - Plan production based on demand forecasts
  - Monitor batch numbers and track yields

- **Sales Tracking**

  - Record and analyze sales data
  - Track product performance
  - Generate sales reports

- **Demand Forecasting**

  - AI-powered demand prediction using TensorFlow
  - Historical sales data analysis
  - Ingredient requirement planning based on forecasts

- **Supplier Management**

  - Maintain supplier information
  - Track ordering history
  - Manage supplier relationships

- **Dashboard Analytics**
  - Real-time inventory status visualization
  - Production efficiency metrics
  - Sales performance charts

## Technologies

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **AI/ML**: TensorFlow.js for demand forecasting
- **Charts**: Recharts, Chart.js
- **UI Components**: Radix UI, shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase account (for auth)

### Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bakery-web-app.git
   cd bakery-web-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/bakery_db
   DIRECT_URL=postgresql://username:password@localhost:5432/bakery_db
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Initialize the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Seed the database with initial data:
   ```bash
   npx prisma db seed
   ```

### Development

Run the development server:

```bash
npm run dev
```

Access the application at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Authentication**: Login or sign up using the auth system
2. **Dashboard**: View critical inventory alerts and recent activities
3. **Ingredients**: Manage your inventory of ingredients
4. **Recipes**: Create and manage your bakery recipes
5. **Production**: Record production batches and ingredient usage
6. **Sales**: Track daily sales and product performance
7. **Forecasts**: Generate demand predictions for future planning
8. **Suppliers**: Manage your ingredient suppliers

## Database Schema

The application uses a PostgreSQL database with the following main entities:

- Ingredients
- Recipes
- Batches
- Production Records
- Sales
- Users
- Suppliers
- Demand Forecasts

## Deployment

The application can be deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fbakery-web-app)

Make sure to configure the environment variables in your Vercel project settings.

## License

[MIT](LICENSE)
