/**
 * Contact / enquiry route — /api/contact
 * POST /api/contact — store a general enquiry message
 *
 * Messages are logged to the database when Supabase is configured.
 * Without Supabase they are logged to the console (dev mode).
 */
import { Router } from 'express';
import { isSupabaseAdminConfigured, supabaseAdmin } from '../supabase.js';
import { validateContact } from '../middleware/validate.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', contactLimiter, asyncHandler(async (req, res) => {
  const errors = validateContact(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const { name, email, subject, message } = req.body;

  const enquiry = {
    name:    name.trim(),
    email:   email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim()
  };

  if (isSupabaseAdminConfigured) {
    const { error } = await supabaseAdmin.from('contact_enquiries').insert(enquiry);
    if (error) {
      console.error('[CONTACT] DB insert failed:', error.message);
      return res.status(500).json({ message: 'Could not save your message. Please try again later.' });
    }
  } else {
    console.info('[CONTACT]', enquiry);
  }

  res.status(201).json({ message: 'Your message has been received. We will get back to you soon!' });
}));

export default router;
