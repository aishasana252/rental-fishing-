import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lure_id, amount } = await req.json();

    if (!lure_id || !amount) {
      return NextResponse.json({ error: 'Lure ID and Amount are required' }, { status: 400 });
    }

    const res = await query(
      `UPDATE lures 
       SET stock_qty = stock_qty + $1, total_qty = total_qty + $1 
       WHERE id = $2 
       RETURNING *`,
      [parseInt(amount), parseInt(lure_id)]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Lure not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (error) {
    console.error('API Lures Restock Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
