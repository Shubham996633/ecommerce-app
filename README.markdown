# TechShop E-Commerce Application

TechShop is a modern e-commerce platform built with Next.js, featuring user authentication, product browsing, cart management, Stripe payments, and order history. The application is fully dockerized, including both the Next.js app and a PostgreSQL database, and can be run with a single command.

## Documentary Video

To learn more about TechShop and see a walkthrough of its features, watch documentary video:

### Watch the TechShop App Documentary Video

[![alt text](https://github.com/user-attachments/assets/82eb2ed8-def3-47cb-8513-0d89697ac333)](https://www.youtube.com/watch?v=k8or1-cJJ4Q)


## Features

- **Authentication**: Secure user authentication with Clerk, including webhook integration to save user data in the database before granting access.
- **Dashboard**: Responsive product catalog with cards displaying product details, and options to view, add to cart, or buy now.
- **Product Page**: Dedicated page for each product with detailed information, add-to-cart, and buy-now options, plus "You May Like" product recommendations.
- **Cart Page**: Manage cart items with quantity adjustments, view total price, and proceed to checkout.
- **Delivery Page**: Add or select shipping addresses with a user-friendly interface.
- **Payment Page**: Order summary with product details and address, integrated with Stripe for secure payments.
- **Success Page**: Displays payment verification progress, sends a confirmation email via EmailJS, and redirects to the account page.
- **Account Page**: View user details, past orders with filters (search by ID/status, amount range), and logout functionality.
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS for consistent styling across devices.
- **Toast Notifications**: Real-time feedback for user actions (e.g., adding to cart, payment success) using `react-hot-toast`.
- **Database Seeding**: Pre-populates the database with sample products and data via a Prisma seed script.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide React (icons), react-hot-toast
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Authentication**: Clerk with webhook integration
- **Payments**: Stripe
- **Email**: EmailJS for order confirmation emails
- **Containerization**: Docker, Docker Compose
- **Database**: PostgreSQL 15

## Project Structure

Below is an overview of the project's directory structure and key files:

```
.
├── app/                        # Next.js App Router directory
│   ├── (auth)/                 # Authentication-related routes (e.g., sign-in, sign-up)
│   ├── account/                # Account page for user details and order history
│   │   ├── page.tsx            # Account page displaying user info and past orders
│   │   └── AccountClient.tsx   # Client component for interactive filters and order display
│   ├── cart/                   # Cart page for managing items
│   │   └── page.tsx            # Displays cart items, quantity adjustments, and total price
│   ├── delivery/               # Delivery page for address selection
│   │   └── page.tsx            # Add/select shipping address for checkout
│   ├── payment/                # Payment page for order summary and Stripe integration
│   │   └── page.tsx            # Shows order summary and processes payment
│   ├── payment/success/        # Success page after payment
│   │   └── page.tsx            # Displays payment verification progress and sends email
│   ├── product/[id]/           # Dynamic route for individual product pages
│   │   └── page.tsx            # Dedicated product page with details and related products
│   ├── api/                    # Next.js API routes
│   │   ├── purchase/           # API for fetching purchase details
│   │   ├── user/               # API for fetching user details
│   │   ├── address/            # API for fetching address details
│   │   ├── verify-payment/     # API for payment verification
│   │   ├── webhooks/           # Webhook endpoints
│   │   │   ├── clerk/          # Clerk webhook for user creation
│   │   │   └── stripe/         # Stripe webhook for payment events
│   ├── layout.tsx              # Root layout with global styles and providers
│   └── page.tsx                # Dashboard/Home page with product catalog
├── components/                 # Reusable React components
│   ├── ui/                     # UI components (e.g., Button, Input)
│   ├── AppNavbar.tsx           # Navigation bar with logout functionality
│   ├── ProductCard.tsx         # Product card for dashboard and product pages
│   ├── CartItem.tsx            # Cart item component with quantity controls
│   └── AddressSelector.tsx     # Component for adding/selecting addresses
├── lib/                        # Utility functions and Prisma client
│   └── prisma.ts               # Prisma client setup
├── prisma/                     # Prisma schema and migrations
│   ├── migrations/             # Auto-generated migration files
│   ├── schema.prisma           # Prisma schema defining models (User, Product, Purchase, etc.)
│   └── seed.ts                 # Database seeding script for sample data
├── public/                     # Static assets
│   ├── images/                 # Product images and other static assets
│   └── favicon.ico

```
## Prerequisites

- **Docker**: Install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).
- **Node.js**: Required for local development (optional for Docker-only usage).
- **Environment Variables**: Create a `.env` file in the project root with the following (values provided in your configuration):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY={{NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}}
CLERK_SECRET_KEY={{CLERK_SECRET_KEY}}
CLERK_WEBHOOK_SECRET={{CLERK_WEBHOOK_SECRET}}

# Database
DATABASE_URL={{DATABASE_URL}}

# Stripe
STRIPE_PUBLISHABLE_KEY={{STRIPE_PUBLISHABLE_KEY}}
STRIPE_SECRET_KEY={{STRIPE_SECRET_KEY}}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY={{NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}}
STRIPE_WEBHOOK_SECRET={{STRIPE_WEBHOOK_SECRET}}

# Next.js
NEXT_PUBLIC_BASE_URL={{NEXT_PUBLIC_BASE_URL}}

# Email.js
NEXT_PUBLIC_EMAILJS_SERVICE_ID={{NEXT_PUBLIC_EMAILJS_SERVICE_ID}}
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID={{NEXT_PUBLIC_EMAILJS_TEMPLATE_ID}}
NEXT_PUBLIC_EMAILJS_USER_ID={{NEXT_PUBLIC_EMAILJS_USER_ID}}
```

## Setup and Running with Docker

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Create `.env` File**:
   Copy the environment variables above into a `.env` file in the project root.

3. **Build and Run with Docker Compose**:
   Run the following command to build the application, set up the database, run migrations, seed the database, and start the app:

   ```bash
   docker-compose up --build
   ```

   - This command builds the Docker images, starts the containers, and runs the app on `http://localhost:3000`.
   - The database is initialized with the Prisma migrations and seeded with sample data (`prisma/seed.ts`).

4. **Access the Application**:
   - Open `http://localhost:3000` in your browser.
   - The PostgreSQL database is accessible on `localhost:5432` (if needed for debugging).
   - Setup the Ngrok with `http http://localhost:3000` so it would give the live url and paste it to clerk webhook with as `"Ngrok URL"/api/webhooks/clerk`
      Example as `https://3db7-2401-4900-a15a-9e90-f002-acd8-1d1f-dcdc.ngrok-free.app/api/webhooks/clerk`
      For this you need to setup the clerk and in webhook select user all events
   - Setup the stripe cli by
     First install stripe cli and run `stripe login` then login
     Then run `stripe listen --forward-to localhost:3000/api/webhooks/stripe/route.ts` for the webhook and add to `.env`
   - Then after adding clerk webhook and stripe webhook now run the application 
   

5. **Stop the Application**:
   To stop and remove the containers:

   ```bash
   docker-compose down
   ```

   To also remove the database volume:

   ```bash
   docker-compose down -v
   ```

## Development (Optional)

For local development without Docker:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

3. Seed the database:

   ```bash
   npm run prisma-seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

