# Bakery Management System

<<<<<<< HEAD
A comprehensive web application for bakery inventory management, production planning, sales tracking, and demand forecasting.

## Overview
=======
<div align="center">
  <img src="https://github.com/user-attachments/assets/a76b9649-711c-410a-9a70-01184ac8b011" alt="BakeryTrack Logo" width="150"/>
  
  **[GitHub Repository](https://github.com/tangweilun/bakery_ims.git) | [Live Demo](https://heroic-tarsier-db5266.netlify.app/)**
</div>

## Overview

BakeryTrack is a comprehensive web application designed to streamline bakery operations through efficient inventory management, production planning, sales tracking, and intelligent demand forecasting. Built with modern web technologies, BakeryTrack helps bakeries minimize waste, optimize stock levels, and improve overall efficiency.

## Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/d291ad6e-31f8-4b42-a040-bd48de8ac4ad" alt="Dashboard" width="600"/>
  <p><em>Dashboard Overview</em></p>
  
  <img src="https://github.com/user-attachments/assets/46eea5b8-23d2-48e8-8e7c-3a3966b4a32b" alt="Ingredient Management" width="600"/>
  <p><em>Ingredient Management</em></p>
  
  <img src="https://github.com/user-attachments/assets/3aeb9507-04ff-4ee8-a7de-dd0698135c93" alt="Recipe Management" width="600"/>
  <p><em>Recipe Management</em></p>
  
  <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
    <img src="https://github.com/user-attachments/assets/2c933df3-0175-46e1-9020-6adf85bff37f" alt="Batch Tracking" width="290"/>
    <img src="https://github.com/user-attachments/assets/ac161641-b497-4da7-90e5-e5d9e2eb92b4" alt="Sales Analytics" width="290"/>
    <img src="https://github.com/user-attachments/assets/fad25d90-aa86-4ff9-8e9c-40f872fa0cb5" alt="Demand Forecasting" width="290"/>
  </div>
</div>
>>>>>>> 36bf19886ec7d7a198129c3a55847363606d3a20

This Bakery Management System is designed to help bakery businesses efficiently manage their ingredients, recipes, production, and sales. It includes features for inventory tracking, demand forecasting, recipe management, and analytics dashboards to optimize operations and reduce waste.

<<<<<<< HEAD
## Features
=======
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
>>>>>>> 36bf19886ec7d7a198129c3a55847363606d3a20

- **Ingredient Management**

<<<<<<< HEAD
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
=======
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
>>>>>>> 36bf19886ec7d7a198129c3a55847363606d3a20

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase account (for auth)

### Environment Setup

<<<<<<< HEAD
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
=======
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

3. **Set up environment variables:**

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
>>>>>>> 36bf19886ec7d7a198129c3a55847363606d3a20
   ```

### Development

<<<<<<< HEAD
Run the development server:

```bash
npm run dev
```

Access the application at [http://localhost:3000](http://localhost:3000)

### Production Build
=======
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
>>>>>>> 36bf19886ec7d7a198129c3a55847363606d3a20

```bash
npm run build
npm start
```

<<<<<<< HEAD
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
=======
1. **For Development:**

   Start the development server with hot-reloading:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open your browser and navigate to `http://localhost:3000`.

2. **For Production:**

   Build the application for production:

   ```bash
   npm run build
   # or
   yarn build
   ```

   Then, start the production server:

   ```bash
   npm run start
   # or
   yarn start
   ```

   The application will typically be available at `http://localhost:3000`.

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
>>>>>>> 36bf19886ec7d7a198129c3a55847363606d3a20
