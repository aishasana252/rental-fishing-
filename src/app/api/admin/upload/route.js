import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + '-' + file.name.replace(/\s+/g, '-');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    let fileUrl;
    
    // On serverless environments like Vercel, the file system is read-only.
    // We try to save locally first (for development), and if that fails or we are in production,
    // we fall back to a Base64 Data URL which stores the image directly in the database.
    try {
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        // Force base64 in production to avoid ephemeral filesystem loss on Vercel
        throw new Error('Vercel read-only filesystem');
      }
      
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/${filename}`;
    } catch (fsError) {
      console.warn('Filesystem write failed or bypassed. Falling back to Base64 data URL for Vercel deployment:', fsError.message);
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      fileUrl = `data:${mimeType};base64,${base64Data}`;
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('API image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
