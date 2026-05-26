import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const res = await query(
      'INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *;',
      [name, email, phone || '', message]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to record contact message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: res.rows[0] });
  } catch (error) {
    console.error('API Contact submit error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
