import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET — fetch rental gallery images (public)
export async function GET() {
  try {
    const res = await query(
      `SELECT content_data FROM site_content WHERE section_key = 'rental_gallery' LIMIT 1;`
    );
    const images = res.rows.length > 0 ? (res.rows[0].content_data?.images || []) : [];
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Rental gallery GET error:', error);
    return NextResponse.json({ images: [] });
  }
}

// POST — admin saves/updates gallery images array
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { images } = await request.json();
    if (!Array.isArray(images)) {
      return NextResponse.json({ error: 'Images array required.' }, { status: 400 });
    }

    const content_data = { images };

    // Upsert: update if exists, insert if not
    const existing = await query(
      `SELECT id FROM site_content WHERE section_key = 'rental_gallery' LIMIT 1;`
    );

    if (existing.rows.length > 0) {
      await query(
        `UPDATE site_content SET content_data = $1 WHERE section_key = 'rental_gallery';`,
        [JSON.stringify(content_data)]
      );
    } else {
      await query(
        `INSERT INTO site_content (section_key, content_data) VALUES ('rental_gallery', $1);`,
        [JSON.stringify(content_data)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rental gallery POST error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
