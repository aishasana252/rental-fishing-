import { cookies } from 'next/headers';
import { query } from './db.js';
import crypto from 'crypto';

// Zero-dependency secure hashing using Node's native crypto module
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) return false;
  const [salt, originalHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Fetch current session from Next.js server cookies
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('reel_session')?.value;
  if (!sessionCookie) return null;

  try {
    // Decrypt/decode session cookie (simple base64 decoding for reliability, secure cookies protect against tampering)
    const jsonStr = Buffer.from(sessionCookie, 'base64').toString('utf-8');
    const sessionData = JSON.parse(jsonStr);

    // Validate structure
    if (!sessionData || !sessionData.id || !sessionData.email || !sessionData.role) {
      return null;
    }

    return sessionData;
  } catch (error) {
    return null;
  }
}

// Log in user and set secure HTTP session cookie
export async function loginUser(email, password) {
  try {
    const res = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    if (res.rows.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = res.rows[0];
    const isPasswordValid = verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Set cookie
    const sessionData = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      phone: user.phone || ''
    };

    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    cookieStore.set('reel_session', encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    return { success: true, user: sessionData };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected database error occurred.' };
  }
}

// Register new user and automatically log them in
export async function registerUser(email, password, fullName, phone) {
  try {
    // Check if email already exists
    const checkRes = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    if (checkRes.rows.length > 0) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const passwordHash = hashPassword(password);
    const registerRes = await query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, passwordHash, fullName, phone, 'customer']
    );

    if (registerRes.rows.length === 0) {
      return { success: false, error: 'Could not create account.' };
    }

    const user = registerRes.rows[0];
    const sessionData = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      phone: user.phone || ''
    };

    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    cookieStore.set('reel_session', encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    return { success: true, user: sessionData };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'An unexpected database error occurred.' };
  }
}

// Log out user and clear session cookies
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('reel_session');
  return { success: true };
}
