import { loginUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const res = await loginUser(email, password);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: res.user });
  } catch (error) {
    console.error('API login error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
