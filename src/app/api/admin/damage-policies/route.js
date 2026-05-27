import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, price, image_url, broken_images } = await req.json();

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and Price are required' }, { status: 400 });
    }

    const res = await query(
      'INSERT INTO damage_policies (name, price, image_url, broken_images) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, parseFloat(price), image_url || '', JSON.stringify(broken_images || [])]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create damage policy' }, { status: 500 });
    }

    return NextResponse.json({ success: true, policy: res.rows[0] });
  } catch (error) {
    console.error('API create damage policy error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
    }

    await query('DELETE FROM damage_policies WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API delete damage policy error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, price, image_url } = await req.json();

    if (!id || !name || price === undefined) {
      return NextResponse.json({ error: 'ID, Name and Price are required' }, { status: 400 });
    }

    const res = await query(
      'UPDATE damage_policies SET name = $1, price = $2, image_url = $3 WHERE id = $4 RETURNING *',
      [name, parseFloat(price), image_url || '', parseInt(id)]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Damage policy not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, policy: res.rows[0] });
  } catch (error) {
    console.error('API update damage policy error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
