import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { name, mapLink, distance, feeEstimate } = await request.json();
    if (!name || !mapLink || !distance || !feeEstimate) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO restaurants (name, map_link, distance, fee_estimate, image_url) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [name, mapLink, distance, feeEstimate, '/assets/logo 1.jpeg']
    );

    return NextResponse.json({ success: true, restaurant: res.rows[0] });
  } catch (error) {
    console.error('API Admin add restaurant error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await query('DELETE FROM restaurants WHERE id = $1;', [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Admin delete restaurant error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
