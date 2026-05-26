import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { bookingId, type, fee, description } = await request.json();
    if (!bookingId || !type || !fee) {
      return NextResponse.json({ error: 'Booking ID, type, and fee are required' }, { status: 400 });
    }

    // Insert damage incident
    const res = await query(
      `INSERT INTO damages (booking_id, damage_type, fee_applied, description, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [bookingId, type, parseFloat(fee), description || '', 'pending']
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to record damage incident.' }, { status: 500 });
    }

    // Set corresponding booking status to 'damaged'
    await query("UPDATE bookings SET status = 'damaged' WHERE id = $1;", [bookingId]);

    // Track inventory update (increment damaged_qty by pole quantity)
    // Find the booking pole quantity
    const bookingRes = await query('SELECT pole_quantity FROM bookings WHERE id = $1 LIMIT 1;', [bookingId]);
    if (bookingRes.rows.length > 0 && !isNaN(bookingRes.rows[0].pole_quantity)) {
      const poleQty = parseInt(bookingRes.rows[0].pole_quantity) || 1;
      
      // Update 'Fishing Poles' inventory
      await query(
        `UPDATE inventory 
         SET damaged_qty = damaged_qty + $1 
         WHERE item_name = 'Fishing Poles';`,
        [poleQty]
      );
    }

    return NextResponse.json({ success: true, damage: res.rows[0] });
  } catch (error) {
    console.error('API Admin log damage error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
