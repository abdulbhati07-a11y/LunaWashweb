/**
 * Validation middleware helpers
 * Centralised input validation so routes stay clean.
 */

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? ''));
}

export function isPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidDate(value) {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

export function isFutureDate(value) {
  const d = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

const ALLOWED_SERVICES = ['express', 'dry', 'ironing', 'stain'];
const ALLOWED_PLANS    = ['Basic', 'Premium', 'Elite'];

/**
 * Returns an array of error strings.
 * Empty array = valid.
 */
export function validateBooking(body) {
  const errors = [];
  const { name, email, phone, service, date, plan } = body;

  if (!name || String(name).trim().length < 2)
    errors.push('Name must be at least 2 characters.');

  if (!email || !isEmail(email))
    errors.push('A valid email address is required.');

  if (!phone || !isPhone(phone))
    errors.push('A valid phone number is required (7–15 digits).');

  if (!service || !ALLOWED_SERVICES.includes(service))
    errors.push(`Service must be one of: ${ALLOWED_SERVICES.join(', ')}.`);

  if (!date || !isValidDate(date))
    errors.push('A valid pickup date is required.');
  else if (!isFutureDate(date))
    errors.push('Pickup date must be today or in the future.');

  if (plan && !ALLOWED_PLANS.includes(plan))
    errors.push(`Plan must be one of: ${ALLOWED_PLANS.join(', ')}.`);

  return errors;
}

export function validateRegister(body) {
  const errors = [];
  const { name, email, password } = body;

  if (!name || String(name).trim().length < 2)
    errors.push('Name must be at least 2 characters.');

  if (!email || !isEmail(email))
    errors.push('A valid email address is required.');

  if (!password || String(password).length < 6)
    errors.push('Password must be at least 6 characters.');

  return errors;
}

export function validateSignIn(body) {
  const errors = [];
  const { email, password } = body;

  if (!email || !isEmail(email))
    errors.push('A valid email address is required.');

  if (!password || String(password).length < 1)
    errors.push('Password is required.');

  return errors;
}

export function validateContact(body) {
  const errors = [];
  const { name, email, subject, message } = body;

  if (!name || String(name).trim().length < 2)
    errors.push('Name must be at least 2 characters.');

  if (!email || !isEmail(email))
    errors.push('A valid email address is required.');

  if (!subject || String(subject).trim().length < 3)
    errors.push('Subject must be at least 3 characters.');

  if (!message || String(message).trim().length < 10)
    errors.push('Message must be at least 10 characters.');

  return errors;
}
