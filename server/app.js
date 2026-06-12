/**
 * LÜNA WASH — Express Application
 * ─────────────────────────────────
 * Mounts API routes and global middleware only.
 * The frontend (Vite dev / sirv prod) and final error handlers
 * are attached in server/index.js AFTER this app is exported,
 * so Vite always handles non-API routes before the 404 handler.
 */
import express from 'express';
import cors from 'cors';

import { apiLimiter }   from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRouter   from './routes/health.js';
import authRouter     from './routes/auth.js';
import bookingsRouter from './routes/bookings.js';
import servicesRouter from './routes/services.js';
import plansRouter    from './routes/plans.js';
import contactRouter  from './routes/contact.js';

const app = express();

// ── Global middleware ──────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.use('/api', apiLimiter);

// ── API Routes ─────────────────────────────────────────────────────────────────

app.use('/api/health',   healthRouter);
app.use('/api/auth',     authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/plans',    plansRouter);
app.use('/api/contact',  contactRouter);

// ── API 404 — only fires for unmatched /api/* routes ──────────────────────────

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// ── Global error handler (always last) ────────────────────────────────────────

app.use(errorHandler);

export default app;
