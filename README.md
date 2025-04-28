# BakeryTrack: Smart Bakery Management System

**GitHub Repository:** [https://github.com/tangweilun/bakery_ims.git](https://github.com/tangweilun/bakery_ims.git)
**Live Demo (Netlify):** [https://heroic-tarsier-db5266.netlify.app/](https://heroic-tarsier-db5266.netlify.app/)

A comprehensive web application designed to streamline bakery operations through efficient inventory management, production planning, sales tracking, and intelligent demand forecasting. Built with modern web technologies, BakeryTrack helps bakeries minimize waste, optimize stock levels, and improve overall efficiency.

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Key Features

BakeryTrack offers a suite of tools tailored for bakery management:

- **🍞 Ingredient Management:**

  - Track detailed information for each ingredient (name, description, category, unit, cost).
  - Manage supplier information and link ingredients to suppliers.
  - Set minimum and ideal stock levels for automated alerts and optimized ordering.
  - View current stock levels calculated from non-expired batches.
  - Mark ingredients as active or inactive.

- **📦 Batch Tracking (FIFO & Expiry):**

  - Record incoming ingredient batches with quantity, purchase date, and expiry date.
  - Automatically calculates remaining quantity based on usage.
  - Supports First-In, First-Out (FIFO) logic for usage recommendations (implicitly through expiry date sorting).
  - Dashboard highlights batches nearing expiry.
  - View detailed usage history for each batch.

- **🍰 Recipe Management:**

  - Create and manage detailed recipes, including ingredients, quantities, preparation steps, baking time, and yield.
  - Define selling prices for finished products.
  - Easily view ingredients required for any recipe.

- **📈 Sales Tracking & Analytics:**

  - Record sales transactions, linking sold items to specific recipes.
  - Track sales date, time, day of the week, quantities, and total amount.
  - Provides historical sales data crucial for forecasting.

- **🧠 Demand Forecasting (TensorFlow.js Model):**

  - Predict future demand for specific recipes based on historical sales data.
  - Utilizes a simple **Dense Neural Network** model implemented with **TensorFlow.js** for time-series prediction, trained on past sales patterns.
  - Generates forecasts for a defined period (e.g., the next 7 days).
  - Visualizes predicted vs. actual sales data using charts.
  - Allows saving generated forecasts for future reference.

- **📊 Ingredient Requirements Calculation:**

  - Automatically calculates the total quantity of each ingredient needed based on the demand forecast for a specific recipe.
  - Compares required amounts with current stock levels to identify potential shortages.
  - Visualizes requirements vs. stock using charts.

- **📉 Yield Management & Waste Tracking:**

  - Record ingredient usage during production, specifying reasons like production, spoilage, or waste.
  - Updates ingredient batch quantities automatically.
  - Helps identify areas of high wastage.

- **🔒 User Authentication:**

  - Secure user sign-up, sign-in, and password management powered by **Supabase Auth**.
  - Handles email confirmation and password resets.

- **📜 Activity Logging:**

  - Records key user actions (e.g., adding ingredients, creating sales, updating batches) for audit trails.

- **🖥️ Dashboard Overview:**
  - Provides a quick summary of recent activities and ingredients nearing expiry.

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Supabase
- **Styling:** Tailwind CSS, shadcn/ui
- **Charting:** Chart.js, Recharts
- **State Management:** React Hooks (useState, useEffect)
- **Machine Learning (Forecasting):** TensorFlow.js
- **Deployment:** Netlify (Config files present)

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- PostgreSQL Database
- Supabase Account (for authentication and potentially database hosting)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/tangweilun/bakery_ims.git
    cd bakery-web-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

    **Note:** Ensure you run `npm install` (or `yarn install`) to download all necessary project dependencies before proceeding.

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add the following variables. Replace the placeholder values with your actual credentials.

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

### Database Setup

1.  **Apply Prisma Migrations:**
    This command will synchronize your database schema with the `prisma/schema.prisma` file.

    ```bash
    npx prisma migrate dev --name init
    ```

    _(You might need a different migration name if `init` already exists)_

2.  **(Optional) Seed the database:**
    If you want to populate the database with initial sample data (suppliers, ingredients, recipes):
    ```bash
    npx prisma db seed
    ```
    _(Requires the `prisma/seed.ts` file and `ts-node` to be configured in `package.json`)_

### Running the Application

1.  **For Development:**
    Start the development server with hot-reloading:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open your browser and navigate to `http://localhost:3000`.

2.  **For Production:**
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
    The application will typically be available at `http://localhost:3000` (or the port configured for production).

## Project Structure
