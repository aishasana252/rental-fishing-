import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { itemName, totalQty } = await request.json();
    if (!itemName || !totalQty) {
      return NextResponse.json({ error: 'Item name and total quantity are required.' }, { status: 400 });
    }

    const qty = parseInt(totalQty);
    if (isNaN(qty) || qty < 0) {
      return NextResponse.json({ error: 'Quantity must be a valid positive number.' }, { status: 400 });
    }

    // Insert new inventory item
    const res = await query(
      `INSERT INTO inventory (item_name, total_qty, available_qty, damaged_qty, missing_qty) 
       VALUES ($1, $2, $3, 0, 0) RETURNING *;`,
      [itemName, qty, qty]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create inventory item.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (error) {
    console.error('API create inventory error:', error);
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Inventory item with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
