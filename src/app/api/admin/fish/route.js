import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { name, description, image_url } = await request.json();
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required.' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO fish_species (name, description, image_url) 
       VALUES ($1, $2, $3) RETURNING *;`,
      [name, description, image_url || '/assets/logo 1.jpeg']
    );

    return NextResponse.json({ success: true, fish: res.rows[0] });
  } catch (error) {
    console.error('API Admin add fish species error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Fish species ID is required.' }, { status: 400 });
    }

    await query('DELETE FROM fish_species WHERE id = $1;', [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Admin delete fish species error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { id, name, description, image_url } = await request.json();
    if (!id || !name || !description) {
      return NextResponse.json({ error: 'ID, Name and description are required.' }, { status: 400 });
    }

    const res = await query(
      `UPDATE fish_species SET name = $1, description = $2, image_url = $3 
       WHERE id = $4 RETURNING *;`,
      [name, description, image_url || '/assets/logo 1.jpeg', parseInt(id)]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Fish species not found or update failed.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, fish: res.rows[0] });
  } catch (error) {
    console.error('API Admin edit fish species error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
