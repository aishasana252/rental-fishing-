import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// POST: Add a new fishing spot to the locations CMS
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { name, terrain, coordinates, description, bestTime, lures, difficulty, image } = await request.json();
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required.' }, { status: 400 });
    }

    // Fetch existing locations content
    const existing = await query("SELECT * FROM site_content WHERE section_key = 'locations' LIMIT 1;");
    let spots = [];
    if (existing.rows.length > 0 && existing.rows[0].content_data && Array.isArray(existing.rows[0].content_data.spots)) {
      spots = existing.rows[0].content_data.spots;
    }

    const newSpot = {
      name,
      terrain: terrain || '',
      coordinates: coordinates || '',
      description,
      bestTime: bestTime || '',
      lures: lures || '',
      difficulty: difficulty || 'Beginner',
      image: image || ''
    };

    spots.push(newSpot);

    // Upsert the locations section in site_content
    await query(
      'UPDATE site_content SET content_data = $1 WHERE section_key = $2;',
      [JSON.stringify({ spots }), 'locations']
    );

    return NextResponse.json({ success: true, spot: newSpot, spots });
  } catch (error) {
    console.error('API Admin add fishing spot error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

// DELETE: Remove a fishing spot by index
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const index = parseInt(searchParams.get('index'));
    if (isNaN(index) || index < 0) {
      return NextResponse.json({ error: 'Valid spot index is required.' }, { status: 400 });
    }

    // Fetch existing locations content
    const existing = await query("SELECT * FROM site_content WHERE section_key = 'locations' LIMIT 1;");
    let spots = [];
    if (existing.rows.length > 0 && existing.rows[0].content_data && Array.isArray(existing.rows[0].content_data.spots)) {
      spots = existing.rows[0].content_data.spots;
    }

    if (index >= spots.length) {
      return NextResponse.json({ error: 'Spot index out of bounds.' }, { status: 400 });
    }

    spots.splice(index, 1);

    await query(
      'UPDATE site_content SET content_data = $1 WHERE section_key = $2;',
      [JSON.stringify({ spots }), 'locations']
    );

    return NextResponse.json({ success: true, spots });
  } catch (error) {
    console.error('API Admin delete fishing spot error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

// PUT: Update an existing fishing spot by index
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { index, name, terrain, coordinates, description, bestTime, lures, difficulty, image } = await request.json();
    if (index === undefined || isNaN(parseInt(index)) || parseInt(index) < 0) {
      return NextResponse.json({ error: 'Valid spot index is required for editing.' }, { status: 400 });
    }
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required.' }, { status: 400 });
    }

    // Fetch existing locations content
    const existing = await query("SELECT * FROM site_content WHERE section_key = 'locations' LIMIT 1;");
    let spots = [];
    if (existing.rows.length > 0 && existing.rows[0].content_data && Array.isArray(existing.rows[0].content_data.spots)) {
      spots = existing.rows[0].content_data.spots;
    }

    const idx = parseInt(index);
    if (idx >= spots.length) {
      return NextResponse.json({ error: 'Spot index out of bounds.' }, { status: 400 });
    }

    spots[idx] = {
      name,
      terrain: terrain || '',
      coordinates: coordinates || '',
      description,
      bestTime: bestTime || '',
      lures: lures || '',
      difficulty: difficulty || 'Beginner',
      image: image || spots[idx].image || ''
    };

    await query(
      'UPDATE site_content SET content_data = $1 WHERE section_key = $2;',
      [JSON.stringify({ spots }), 'locations']
    );

    return NextResponse.json({ success: true, spots });
  } catch (error) {
    console.error('API Admin edit fishing spot error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
