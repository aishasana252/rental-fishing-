import React from 'react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import RentalWizard from './components/RentalWizard';

export default async function RentalsPage() {
  const session = await getSession();

  // Load dynamic lures list directly from Supabase / database!
  let lures = [];
  try {
    const res = await query('SELECT * FROM lures ORDER BY id ASC;');
    lures = res.rows;
  } catch (error) {
    console.error('Error fetching lures from database:', error);
  }

  // Load dynamic damage policies list directly from Supabase / database!
  let damagePolicies = [];
  try {
    const res = await query('SELECT * FROM damage_policies ORDER BY id ASC;');
    damagePolicies = res.rows;
  } catch (error) {
    console.error('Error fetching damage policies from database:', error);
  }

  // Load general broken images
  let generalBrokenImages = [];
  try {
    const res = await query("SELECT * FROM site_content WHERE section_key = 'general_broken_images' LIMIT 1;");
    if (res.rows.length > 0) {
      generalBrokenImages = res.rows[0].content_data?.images || [];
    }
  } catch (error) {
    console.error('Error fetching general broken images:', error);
  }

  // Load rental gallery images uploaded by admin
  let galleryImages = [];
  try {
    const res = await query("SELECT content_data FROM site_content WHERE section_key = 'rental_gallery' LIMIT 1;");
    if (res.rows.length > 0) {
      galleryImages = res.rows[0].content_data?.images || [];
    }
  } catch (error) {
    console.error('Error fetching rental gallery images:', error);
  }

  return (
    <div className="py-12 px-4 sm:px-10 lg:pl-8 lg:pr-16 relative z-10 max-w-full w-full space-y-8">
      {/* Pass the dynamic database-backed lures and damage policies to RentalWizard */}
      <RentalWizard 
        session={session} 
        initialLures={lures} 
        initialDamagePolicies={damagePolicies}
        initialGeneralImages={generalBrokenImages}
        initialGalleryImages={galleryImages}
      />
    </div>
  );
}
