# 🧺 LÜNA WASH

> **Premium Laundry Service Web Application** built for **UMT, Lahore**.
> Book laundry pickups, manage subscriptions, track orders, and interact with an AI-powered customer assistant through a modern, responsive interface.

---

## ✨ Features

* 📅 **Online Booking** – Schedule laundry pickups with service type, preferred date, and special instructions.
* 💳 **Subscription Plans** – Choose from **Basic**, **Premium**, or **Elite** plans with monthly and annual billing options.
* 👤 **User Authentication** – Secure registration, sign-in, and booking history.
* 📦 **Live Service Catalog** – Services and pricing plans are dynamically loaded from Supabase.
* 🎨 **Modern UI** – Glassmorphism-inspired interface with **13 themes**, including dark and light modes.
* 🧺 **3D Hero Section** – Interactive Three.js animated laundry scene.
* 🤖 **AI Chat Assistant** – Instantly answers customer questions about services, pricing, and bookings.
* 📱 **Fully Responsive** – Optimized for desktop, tablet, and mobile devices.

---

## 🚀 Tech Stack

| Layer          | Technologies                           |
| -------------- | -------------------------------------- |
| **Frontend**   | React 18, Vite, Three.js, Custom CSS   |
| **Backend**    | Node.js, Express (ESM)                 |
| **Database**   | Supabase (PostgreSQL + Authentication) |
| **Deployment** | Vercel                                 |

---

# ⚡ Quick Start

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/luna-wash-web.git
cd luna-wash-web
npm install
```

## 2. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase credentials inside the `.env` file.

---

## 3. Set Up the Database

Run the `supabase-schema.sql` file in:

**Supabase Dashboard → SQL Editor**

---

## 4. Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

```text
http://127.0.0.1:3000
```

---

# 🔐 Environment Variables

| Variable                    | Description                                  |
| --------------------------- | -------------------------------------------- |
| `SUPABASE_URL`              | Supabase Project URL                         |
| `SUPABASE_ANON_KEY`         | Public anonymous key                         |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service role key                 |
| `VITE_API_BASE_URL`         | API base path (`/api`)                       |
| `SITE_URL`                  | Application URL for authentication redirects |
| `PORT`                      | Server port (Default: `3000`)                |
| `ADMIN_SECRET_KEY`          | Protects admin booking routes                |

> **⚠️ Never commit your `.env` file to GitHub.**

---

# 📜 Available Scripts

| Command                            | Description                                   |
| ---------------------------------- | --------------------------------------------- |
| `npm run dev`                      | Start frontend and backend development server |
| `npm run build`                    | Build the application for production          |
| `npm run start`                    | Start the production server                   |
| `npm run preview`                  | Preview the production build                  |
| `node scripts/full-stack-test.mjs` | Run integration tests                         |

---

# 🌐 API Endpoints

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| GET    | `/api/health`        | Service and database health check   |
| GET    | `/api/services`      | Retrieve available laundry services |
| GET    | `/api/plans`         | Retrieve pricing plans              |
| POST   | `/api/auth/register` | Create a new user account           |
| POST   | `/api/auth/sign-in`  | User login                          |
| GET    | `/api/auth/me`       | Retrieve current user profile       |
| POST   | `/api/bookings`      | Create a new booking                |
| GET    | `/api/bookings`      | View user booking history           |
| POST   | `/api/contact`       | Submit a contact enquiry            |

---

# 📂 Project Structure

```text
luna-wash-web/
│
├── luna-wash/                 # React (Vite) Frontend
│   ├── src/
│   │   └── main.jsx
│   └── css/
│
├── server/                    # Express Backend
│   ├── routes/
│   └── middleware/
│
├── api/                       # Vercel Serverless Functions
│
├── scripts/                   # Integration Tests
│
└── supabase-schema.sql        # Database Schema & Seed Data
```

---

# ☁️ Deployment (Vercel)

1. Push your project to GitHub.
2. Import the repository into **Vercel**.
3. Add all environment variables from `.env.example`.
4. Deploy the project.
5. Set the `SITE_URL` to your live domain.
6. Add the same domain in:

```
Supabase → Authentication → URL Configuration
```

---

# 🔑 Authentication Notes

For **local development**, disable **Confirm Email** in:

```
Supabase → Authentication → Providers → Email
```

For **production**, configure a custom SMTP provider to enable email verification and password recovery.

---

# 📞 Contact

**Developer:** Muhammad Abdullah Bhatti

📧 **Email:** [support@lunawash.com](mailto:support@lunawash.com)

📱 **Phone:** +92 370 4747292

📍 **Location:** UMT, Lahore

---

## © 2026 LÜNA WASH

Built with ❤️ using React, Express, Supabase, and Three.js.
