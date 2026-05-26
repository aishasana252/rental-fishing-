import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { slides, whyChooseUs, guides, spots, dining } = await request.json();
    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json({ error: 'Slides data is required.' }, { status: 400 });
    }

    const content_data = {
      hero: slides.map(s => ({
        title: s.title || '',
        subtitle: s.subtitle || '',
        description: s.description || ''
      })),
      whyChooseUs: {
        text: whyChooseUs || ''
      },
      guides: guides || { title: '', text: '', image: '' },
      spots: spots || { title: '', text: '', image: '' },
      dining: dining || { title: '', text: '', image: '' }
    };

    const res = await query(
      `UPDATE site_content 
       SET content_data = $1 
       WHERE section_key = 'homepage' RETURNING *;`,
      [JSON.stringify(content_data)]
    );

    if (res.rows.length === 0) {
      // If by some chance the seed is gone, let's insert it!
      await query(
        `INSERT INTO site_content (section_key, content_data) VALUES ('homepage', $1);`,
        [JSON.stringify(content_data)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Admin CMS update error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
