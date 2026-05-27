import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminDashboard from './components/AdminDashboard';

export const dynamic = 'force-dynamic';

async function fetchDashboardData() {
  try {
    // 1. Fetch Bookings (joins are mock-processed inside db.js, returning customer details inside bookings query!)
    const bookingsRes = await query('SELECT * FROM bookings;');
    const bookings = bookingsRes.rows;

    // Load lures and damages details for each booking
    const bookingsFull = [];
    for (const b of bookings) {
      const luresRes = await query('SELECT * FROM booking_lures WHERE booking_id = $1;', [b.id]);
      
      const damagesRes = await query('SELECT * FROM damages;');
      const bookingDamages = damagesRes.rows.filter((d) => d.booking_id === b.id);

      bookingsFull.push({
        ...b,
        lures: luresRes.rows,
        damages: bookingDamages
      });
    }

    // 2. Fetch General Inventory
    const invRes = await query('SELECT * FROM inventory;');
    const inventory = invRes.rows;

    // 3. Fetch Lures stock
    const luresRes = await query('SELECT * FROM lures;');
    const lures = luresRes.rows;

    // 4. Fetch Damages catalog logs
    const damagesRes = await query('SELECT * FROM damages;');
    const damages = damagesRes.rows;

    // 5. Fetch all users/customers profiles
    const usersRes = await query('SELECT * FROM users;');
    const customers = usersRes.rows;

    // Attach customer info to bookings to ensure the Admin Dashboard displays name/email
    bookingsFull.forEach((b) => {
      const cust = customers.find((c) => c.id === b.user_id);
      if (cust) {
        if (!b.full_name) b.full_name = cust.full_name;
        if (!b.email) b.email = cust.email;
        if (!b.phone) b.phone = cust.phone;
      }
    });

    // 6. Fetch Contact messages submissions
    const messagesRes = await query('SELECT * FROM contact_messages;');
    const messages = messagesRes.rows;

    // 7. Fetch CMS Site content
    const cmsRes = await query('SELECT * FROM site_content;');
    const cms = cmsRes.rows;

    // 8. Fetch fish species
    const fishRes = await query('SELECT * FROM fish_species;');
    const fishSpecies = fishRes.rows;

    // 9. Fetch partnered restaurants
    const restRes = await query('SELECT * FROM restaurants;');
    const restaurants = restRes.rows;

    // 10. Fetch dynamic damage gear policies
    const policiesRes = await query('SELECT * FROM damage_policies ORDER BY id ASC;');
    const damagePolicies = policiesRes.rows;

    // 11. Fetch guides
    const guidesRes = await query('SELECT * FROM guides ORDER BY id ASC;');
    const guides = guidesRes.rows;

    return {
      bookings: bookingsFull,
      inventory,
      lures,
      damages,
      customers,
      messages,
      cms,
      fishSpecies,
      restaurants,
      damagePolicies,
      guides
    };
  } catch (error) {
    console.error('Critical Admin dashboard query failed:', error);
    return {
      bookings: [],
      inventory: [],
      lures: [],
      damages: [],
      customers: [],
      messages: [],
      cms: [],
      fishSpecies: [],
      restaurants: [],
      damagePolicies: [],
      guides: []
    };
  }
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  // Enforce rigid Admin Role Protection
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const data = await fetchDashboardData();

  return (
    <div className="relative w-full min-h-screen">
      <AdminDashboard session={session} initialData={data} />
    </div>
  );
}
