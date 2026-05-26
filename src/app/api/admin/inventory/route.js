import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { itemName, available_qty, total_qty, damaged_qty, missing_qty } = await request.json();
    if (!itemName) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const res = await query(
      `UPDATE inventory 
       SET available_qty = $1, total_qty = $2, damaged_qty = $3, missing_qty = $4 
       WHERE item_name = $5 RETURNING *;`,
      [
        parseInt(available_qty),
        parseInt(total_qty),
        parseInt(damaged_qty),
        parseInt(missing_qty),
        itemName
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Inventory item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (error) {
    console.error('API Admin inventory update error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const res = await query('DELETE FROM inventory WHERE id = $1 RETURNING id;', [id]);
    
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Inventory item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: res.rows[0].id });
  } catch (error) {
    console.error('API Admin inventory delete error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
