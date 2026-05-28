import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Fetch confirmed/pending bookings for the specific date where a guide was booked
    const res = await query(
      `SELECT guide_start_time, guide_hours 
       FROM bookings 
       WHERE guide_booked = true 
       AND guide_date = $1 
       AND status != 'cancelled'`,
      [date]
    );

    const bookedSlots = res.rows.map(row => ({
      startTime: row.guide_start_time,
      duration: row.guide_hours
    }));

    return NextResponse.json({ slots: bookedSlots });
  } catch (error) {
    console.error('Error fetching guide availability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
