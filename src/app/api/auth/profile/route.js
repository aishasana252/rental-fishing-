import { getSession } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, email, currentPassword, newPassword } = body;

    if (!fullName || !email) {
      return Response.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // Fetch current user from DB
    const userRes = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [session.id]);
    if (userRes.rows.length === 0) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }
    const user = userRes.rows[0];

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return Response.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      }
      const valid = verifyPassword(currentPassword, user.password_hash);
      if (!valid) {
        return Response.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }
      const newHash = hashPassword(newPassword);
      await query(
        'UPDATE users SET full_name = $1, email = $2, password_hash = $3 WHERE id = $4',
        [fullName, email, newHash, session.id]
      );
    } else {
      await query(
        'UPDATE users SET full_name = $1, email = $2 WHERE id = $3',
        [fullName, email, session.id]
      );
    }

    // Refresh the session cookie with updated data
    const newSession = {
      ...session,
      fullName,
      email,
    };
    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(newSession)).toString('base64');
    cookieStore.set('reel_session', encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return Response.json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Profile update error:', error);
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
