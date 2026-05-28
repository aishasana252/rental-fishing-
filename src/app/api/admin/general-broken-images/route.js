import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const res = await query("SELECT content_data FROM site_content WHERE section_key = 'general_broken_images' LIMIT 1;");
    if (res.rows.length === 0) {
      return NextResponse.json({ images: [] });
    }
    return NextResponse.json({ images: res.rows[0].content_data.images || [] });
  } catch (error) {
    console.error('API get general broken images error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { images } = await req.json();

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: 'Images array is required' }, { status: 400 });
    }

    // Upsert the general_broken_images section
    const existing = await query("SELECT * FROM site_content WHERE section_key = 'general_broken_images' LIMIT 1;");
    let currentImages = [];
    
    if (existing.rows.length > 0) {
      currentImages = existing.rows[0].content_data.images || [];
      const updatedImages = [...currentImages, ...images];
      await query(
        'UPDATE site_content SET content_data = $1 WHERE section_key = $2;',
        [JSON.stringify({ images: updatedImages }), 'general_broken_images']
      );
    } else {
      await query(
        "INSERT INTO site_content (section_key, content_data) VALUES ('general_broken_images', $1);",
        [JSON.stringify({ images })]
      );
    }

    return NextResponse.json({ success: true, added: images });
  } catch (error) {
    console.error('API add general broken images error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const existing = await query("SELECT * FROM site_content WHERE section_key = 'general_broken_images' LIMIT 1;");
    if (existing.rows.length > 0) {
      let currentImages = existing.rows[0].content_data.images || [];
      const updatedImages = currentImages.filter(img => img !== imageUrl);
      
      await query(
        'UPDATE site_content SET content_data = $1 WHERE section_key = $2;',
        [JSON.stringify({ images: updatedImages }), 'general_broken_images']
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API delete general broken image error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
