import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET: Retrieve all guides
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const res = await query('SELECT * FROM guides ORDER BY id ASC;');
    return NextResponse.json({ success: true, guides: res.rows });
  } catch (error) {
    console.error('API Admin fetch guides error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

// POST: Add a new guide
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { name, experience, description, image_url } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Guide name is required.' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO guides (name, experience, description, image_url) 
       VALUES ($1, $2, $3, $4) RETURNING *;`,
      [name, experience || '', description || '', image_url || '/assets/logo 1.jpeg']
    );

    return NextResponse.json({ success: true, guide: res.rows[0] });
  } catch (error) {
    console.error('API Admin add guide error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

// PUT: Edit an existing guide
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { id, name, experience, description, image_url } = await request.json();
    if (!id || !name) {
      return NextResponse.json({ error: 'ID and Guide name are required.' }, { status: 400 });
    }

    const res = await query(
      `UPDATE guides SET name = $1, experience = $2, description = $3, image_url = $4 
       WHERE id = $5 RETURNING *;`,
      [name, experience || '', description || '', image_url || '/assets/logo 1.jpeg', parseInt(id)]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Guide not found or update failed.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, guide: res.rows[0] });
  } catch (error) {
    console.error('API Admin edit guide error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

// DELETE: Delete a guide
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Guide ID is required.' }, { status: 400 });
    }

    await query('DELETE FROM guides WHERE id = $1;', [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Admin delete guide error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
