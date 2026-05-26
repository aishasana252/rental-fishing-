import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { User, Calendar, Compass, AlertTriangle, ShieldCheck, Clock, MapPin, Anchor } from 'lucide-react';
import ProfileEditForm from '@/app/components/ProfileEditForm';

async function getUserBookings(userId) {
  try {
    const res = await query('SELECT * FROM bookings WHERE user_id = $1;', [userId]);
    const bookings = res.rows;

    // Fetch lures and damages for each booking
    const fullyLoaded = [];
    for (const b of bookings) {
      const luresRes = await query('SELECT * FROM booking_lures WHERE booking_id = $1;', [b.id]);
      
      // Filter damages for this specific booking
      const damagesRes = await query('SELECT * FROM damages;');
      const bookingDamages = damagesRes.rows.filter((d) => d.booking_id === b.id);

      fullyLoaded.push({
        ...b,
        lures: luresRes.rows,
        damages: bookingDamages
      });
    }

    // Fetch damage policies to calculate the security deposit
    const policiesRes = await query('SELECT * FROM damage_policies;');
    const securityDeposit = policiesRes.rows.reduce((sum, p) => sum + parseFloat(p.price), 0);

    return { bookings: fullyLoaded, securityDeposit };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return { bookings: [], securityDeposit: 0 };
  }
}

export default async function ProfilePage() {
  const session = await getSession();

  // Route protection
  if (!session) {
    redirect('/login?redirect=/profile');
  }

  const { bookings, securityDeposit } = await getUserBookings(session.id);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl mx-auto w-full space-y-12">
      
      {/* 1. CUSTOMER METRICS HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#04282F]/30 border border-[#00B5AD]/15 rounded-2xl p-8 shadow-xl">
        <div className="md:col-span-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="p-4 rounded-full bg-[#00B5AD]/10 border-2 border-[#00B5AD] text-[#00B5AD]">
            <User className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-[10px] font-bold text-[#00B5AD] uppercase tracking-wider">
              {session.role === 'admin' ? 'Administrator' : 'Customer Account'}
            </span>
            <h1 className="text-3xl font-extrabold text-[#FFFFFF] font-['Outfit'] tracking-wide">{session.fullName}</h1>
            <p className="text-xs text-[#A0ACB3] font-semibold">{session.email} • {session.phone || 'No phone set'}</p>
          </div>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-4 text-center border-t md:border-t-0 md:border-l border-[#00B5AD]/15 pt-6 md:pt-0 md:pl-8 text-xs font-bold uppercase text-[#6B7A82]">
          <div className="space-y-1">
            <span className="block text-2xl font-black text-[#00B5AD] font-['Outfit']">{bookings.length}</span>
            <span>Total Bookings</span>
          </div>
          <div className="space-y-1">
            <span className="block text-2xl font-black text-[#00B5AD] font-['Outfit']">
              {bookings.filter((b) => b.status === 'active' || b.status === 'confirmed').length}
            </span>
            <span>Active Reservations</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 2. RENTAL HISTORY - 8 COLUMNS */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-l-4 border-[#00B5AD] pl-3">
            My Reservation Logs
          </h2>

          {bookings.length === 0 ? (
            <div className="text-center py-16 p-8 border border-[#00B5AD]/10 rounded-2xl bg-[#001418]/40 space-y-4">
              <p className="text-xs text-[#6B7A82] font-semibold">You have no active gear rentals or guided fishing tours booked yet.</p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/services/rentals"
                  className="bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-lg"
                >
                  Rent Gear
                </Link>
                <Link
                  href="/services/guide"
                  className="border border-[#00B5AD]/45 hover:bg-[#00B5AD]/10 text-[#00B5AD] font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-lg"
                >
                  Book Guide
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-[#00B5AD]/10 bg-[#04282F]/15 p-6 shadow-md space-y-4"
                >
                  
                  {/* Header Row */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#6B7A82] uppercase block tracking-wider">
                        Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#FFFFFF] font-['Outfit'] tracking-wide">
                        {booking.guide_booked ? 'Guided Shore Excursion' : `Shore Gear Rental (${booking.pole_quantity} ${booking.pole_quantity === 1 ? 'Pole' : 'Poles'})`}
                      </h3>
                    </div>
                    
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        booking.status === 'confirmed' || booking.status === 'active'
                          ? 'bg-[#00B5AD]/10 border-[#00B5AD]/40 text-[#00B5AD]'
                          : booking.status === 'returned'
                          ? 'bg-[#6B7A82]/10 border-[#6B7A82]/30 text-[#6B7A82]'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Booking details card */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-[#A0ACB3] pt-2 border-t border-[#00B5AD]/5">
                    {booking.guide_booked ? (
                      <>
                        <div>
                          <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Date</span>
                          <span className="text-[#FFFFFF]">
                            {new Date(booking.guide_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Hours</span>
                          <span className="text-[#FFFFFF]">{booking.guide_hours} Hours Excursion</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Pickup Point</span>
                          <span className="text-[#00B5AD] break-all">{booking.guide_pickup_location}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Duration</span>
                          <span className="text-[#FFFFFF]">{booking.rental_duration} Days Rental</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Tackleboxes</span>
                          <span className="text-[#FFFFFF]">{booking.pole_quantity} Deluxe Included</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Tackles Line</span>
                          <span className="text-[#FFFFFF]">30 lb Test (Standard)</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Rental Lures if any */}
                  {booking.lures && booking.lures.length > 0 && (
                    <div className="p-3 bg-[#001418]/60 border border-[#00B5AD]/10 rounded-xl space-y-2">
                      <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Selected Lures</span>
                      <div className="flex flex-wrap gap-2">
                        {booking.lures.map((l, idx) => (
                          <span
                            key={idx}
                            className="bg-[#04282F] border border-[#00B5AD]/20 text-[#A0ACB3] text-[10px] font-semibold px-2.5 py-1 rounded-md"
                          >
                            {l.lure_name} (x{l.quantity})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Damages logs if any */}
                  {booking.damages && booking.damages.length > 0 && (
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl space-y-1.5 text-xs text-red-400 font-semibold">
                      <span className="block text-[9px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Damage Incident Reported
                      </span>
                      {booking.damages.map((dmg, idx) => (
                        <div key={idx} className="flex justify-between border-t border-red-500/10 pt-1.5">
                          <span>{dmg.damage_type} ({dmg.status})</span>
                          <span className="font-extrabold text-red-400">${dmg.fee_applied}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing Footer */}
                  <div className="border-t border-[#00B5AD]/5 pt-3.5 space-y-2">
                    {!booking.guide_booked && (
                      <div className="bg-[#0A424A]/30 p-3 rounded-lg border border-[#00B5AD]/10 space-y-2 mb-3">
                        <span className="text-[10px] font-bold text-[#6B7A82] uppercase block mb-1">Security Deposit Breakdown</span>
                        <div className="flex justify-between items-baseline text-[10px] font-semibold">
                          <span className="text-[#A0ACB3]">Added (Refundable)</span>
                          <span className="text-[#00B5AD]">${(parseFloat(booking.security_added) || securityDeposit).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-[10px] font-semibold">
                          <span className="text-red-400">Deducted (Damages)</span>
                          <span className="text-red-400">${parseFloat(booking.security_deducted || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-[10px] font-semibold border-t border-[#00B5AD]/10 pt-1.5 mt-1">
                          <span className="text-[#A0ACB3]">Released / Refunded</span>
                          <span className="text-[#00B5AD]">${parseFloat(booking.security_released || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline border-t border-[#00B5AD]/5 pt-2">
                      <span className="text-[10px] font-bold text-[#6B7A82] uppercase">Transaction Total</span>
                      <span className="text-[#00B5AD] text-base font-black font-['Outfit']">${parseFloat(booking.total_price).toFixed(2)}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. RIGHT COLUMN - Edit Profile + Instructions */}
        <div className="lg:col-span-4 space-y-8">

          {/* EDIT PROFILE CARD */}
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-l-4 border-[#00B5AD] pl-3 mb-6">
              Edit Profile
            </h2>
            <div className="rounded-2xl border border-[#00B5AD]/15 bg-[#0A424A]/40 p-6">
              <ProfileEditForm
                initialName={session.fullName}
                initialEmail={session.email}
              />
            </div>
          </div>

          {/* PICKUP & RETURN INSTRUCTIONS */}
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-l-4 border-[#00B5AD] pl-3">
              Red Hook Instructions
            </h2>

          <div className="rounded-2xl border border-[#00B5AD]/15 bg-[#0A424A]/40 p-6 space-y-6">
            
            {/* Timing */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[#00B5AD] text-[10px] font-black uppercase tracking-wider bg-[#00B5AD]/15 border border-[#00B5AD]/30 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                Pickup & Return Hours
              </span>
              <h4 className="text-[#FFFFFF] text-base font-extrabold font-['Outfit']">7:00 AM – 8:00 AM Daily</h4>
              <p className="text-[11px] font-semibold text-[#6B7A82] leading-relaxed">
                All gear must be picked up and returned during this morning window at our Red Hook Harbor dock station to prevent late fees ($100 penalty).
              </p>
            </div>

            {/* Instruction list */}
            <div className="space-y-4 border-t border-[#00B5AD]/10 pt-4 text-xs font-semibold text-[#A0ACB3] leading-relaxed">
              <div className="space-y-1">
                <h5 className="text-[#FFFFFF] font-extrabold uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#00B5AD]" />
                  Where to Pick Up
                </h5>
                <p className="text-[11px] text-[#6B7A82] pl-5">
                  Find our marked Reel Problems Dock slip right next to the Red Hook Ferry terminal entrance.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="text-[#FFFFFF] font-extrabold uppercase flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-[#00B5AD]" />
                  What to Bring
                </h5>
                <p className="text-[11px] text-[#6B7A82] pl-5">
                  Please bring your phone showing your account booking dashboard code and a valid photo ID.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="text-[#FFFFFF] font-extrabold uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#00B5AD]" />
                  How Gear Works
                </h5>
                <p className="text-[11px] text-[#6B7A82] pl-5">
                  Our dock attendant will fully test your reel drag adjustments, explain the 30 lb line capacity, and inspect the tacklebox inventory with you before you set off!
                </p>
              </div>
            </div>

          </div>
          </div>
        </div>

      </div>

    </div>
  );
}
