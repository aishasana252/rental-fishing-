import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, price, image_url, stock_qty } = await req.json();

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and Price are required' }, { status: 400 });
    }

    const qty = stock_qty || 20;
    const res = await query(
      'INSERT INTO lures (name, price, image_url, stock_qty, total_qty) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, parseFloat(price), image_url || '/assets/logo 1.jpeg', qty, qty]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create lure' }, { status: 500 });
    }

    return NextResponse.json({ success: true, lure: res.rows[0] });
  } catch (error) {
    console.error('API create lure error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lure ID is required' }, { status: 400 });
    }

    await query('DELETE FROM lures WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API delete lure error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
