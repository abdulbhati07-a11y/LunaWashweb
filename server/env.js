/**
 * Load .env from project root when not using Node's --env-file flag
 * (e.g. direct node invocation or some hosting environments).
 * Existing process.env values are never overwritten.
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
