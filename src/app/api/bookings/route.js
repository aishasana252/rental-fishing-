import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to make reservations.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      rental_duration,
      pole_quantity,
      guide_booked,
      guide_hours,
      guide_date,
      guide_pickup_location,
      damage_agreement,
      total_price,
      security_added,
      payment_status,
      status,
      rental_date,
      child_pole_quantity,
      child_pole_date,
      selectedLures // Expect [{ id, name, price, quantity }] for rentals
    } = body;

    // 1. Create the base Booking record
    const bookingRes = await query(
      `INSERT INTO bookings (
        user_id, rental_duration, pole_quantity, 
        guide_booked, guide_hours, guide_date, guide_pickup_location, 
        damage_agreement, total_price, security_added, payment_status, status,
        rental_date, child_pole_quantity, child_pole_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;`,
      [
        session.id,
        rental_duration ? parseInt(rental_duration) : null,
        pole_quantity ? parseInt(pole_quantity) : null,
        !!guide_booked,
        guide_hours ? parseInt(guide_hours) : null,
        guide_date || null,
        guide_pickup_location || null,
        !!damage_agreement,
        parseFloat(total_price),
        security_added ? parseFloat(security_added) : 0.00,
        payment_status || 'pending',
        status || 'pending',
        rental_date || null,
        child_pole_quantity ? parseInt(child_pole_quantity) : 0,
        child_pole_date || null
      ]
    );

    if (bookingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to record booking transaction' }, { status: 500 });
    }

    const booking = bookingRes.rows[0];

    // 2. If lures are selected, insert into booking_lures junction
    if (selectedLures && Array.isArray(selectedLures) && selectedLures.length > 0) {
      for (const lure of selectedLures) {
        await query(
          `INSERT INTO booking_lures (booking_id, lure_id, lure_name, price, quantity)
           VALUES ($1, $2, $3, $4, $5);`,
          [booking.id, lure.id, lure.name, lure.price, lure.quantity]
        );
        // Deduct lure from stock_qty
        await query(
          `UPDATE lures SET stock_qty = stock_qty - $1 WHERE id = $2;`,
          [lure.quantity, lure.id]
        );
      }
    }

    // 3. Deduct Fishing Poles and associated gear from available inventory (Adult + Child)
    const adultQty = pole_quantity ? parseInt(pole_quantity) : 0;
    const childQty = child_pole_quantity ? parseInt(child_pole_quantity) : 0;
    const totalPolesQty = adultQty + childQty;

    if (totalPolesQty > 0) {
      // Deduct Fishing Poles
      await query(
        `UPDATE inventory SET available_qty = available_qty - $1 WHERE item_name = 'Fishing Poles';`,
        [totalPolesQty]
      );
      
      // Deduct associated gear per pole
      await query(
        `UPDATE inventory SET available_qty = available_qty - $1 WHERE item_name IN ('Tackleboxes', 'Pliers', 'Weights (pack)');`,
        [totalPolesQty]
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('API booking reservation error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while processing reservation.' },
      { status: 500 }
    );
  }
}
