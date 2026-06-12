LÜNA WASH
Premium laundry service web app — book pickups, manage subscriptions, and track orders. Built for UMT, Lahore.

Stack Stack Stack

Features
Online booking — schedule pickups with service type, date, and notes
3 pricing plans — Basic, Premium, Elite (monthly / annual toggle)
User accounts — register, sign in, view booking history
Live catalog — services & plans loaded from Supabase
13 themes — dark & light glassmorphism UI
3D hero — Three.js animated laundry scene
AI chat assistant — answers questions about services, pricing & booking
Fully responsive — mobile, tablet, desktop
Tech Stack
Layer	Tech
Frontend
React 18, Vite, Three.js, Custom CSS
Backend
Node.js, Express (ESM)
Database
Supabase (PostgreSQL + Auth)
Deploy
Vercel-ready
Quick Start
# 1. Clone & install
git clone https://github.com/YOUR_USERNAME/luna-wash-web.git
cd luna-wash-web
npm install
# 2. Configure environment
cp .env.example .env
# Fill in your Supabase keys
# 3. Set up database
# Run supabase-schema.sql in Supabase Dashboard → SQL Editor
# 4. Run
npm run dev
Open http://127.0.0.1:3000

Environment Variables
Variable	Description
SUPABASE_URL
Supabase project URL
SUPABASE_ANON_KEY
Public anon key
SUPABASE_SERVICE_ROLE_KEY
Server-side admin key
VITE_API_BASE_URL
API base path (/api)
SITE_URL
App URL for auth email redirects
PORT
Server port (default 3000)
ADMIN_SECRET_KEY
Protects admin booking routes
Never commit .env to Git.

Scripts
Command	Description
npm run dev
Start dev server (frontend + API)
npm run build
Build frontend for production
npm run start
Run production server
npm run preview
Build + start production
node scripts/full-stack-test.mjs
Run integration tests
API Endpoints
Method	Route	Description
GET
/api/health
Service & DB status
GET
/api/services
List active services
GET
/api/plans
List pricing plans
POST
/api/auth/register
Create account
POST
/api/auth/sign-in
Sign in
GET
/api/auth/me
Current user profile
POST
/api/bookings
Create booking
GET
/api/bookings
List user bookings
POST
/api/contact
Submit enquiry
Project Structure
luna-wash-web/
├── luna-wash/          # React SPA (Vite)
│   ├── src/main.jsx    # App entry
│   └── css/            # Themes & styles
├── server/             # Express API
│   ├── routes/         # auth, bookings, services…
│   └── middleware/     # rate limit, validation
├── api/                # Vercel serverless entry
├── scripts/            # Integration tests
└── supabase-schema.sql # Database schema + seed data
Deployment (Vercel)
Push to GitHub
Import repo in Vercel
Add all env vars from .env.example
Deploy — vercel.json is preconfigured
Set SITE_URL to your live domain and add it to Supabase → Authentication → URL Configuration.

Auth Note
For local development, disable Confirm email in Supabase (Authentication → Providers → Email). Use custom SMTP for production email delivery.

Contact
Phone: +92 370 4747292
Email: support@lunawash.com
Area: UMT, Lahore
Made by Muhammad Abdullah Bhatti · © 2026 LÜNA WASH
