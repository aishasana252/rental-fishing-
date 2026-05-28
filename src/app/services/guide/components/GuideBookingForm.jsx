'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, MapPin, CreditCard, CheckCircle, ArrowRight, User } from 'lucide-react';

export default function GuideBookingForm({ session, initialGuides = [] }) {
  const [formData, setFormData] = useState({
    date: '',
    hours: '2',
    guideName: 'First Available (Assign Best Expert)',
    startTime: '08:00 AM',
    pickupLocation: 'Red Hook',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, text: '' });
  const router = useRouter();
 
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
 
  // Enforce blackout dates by setting the minimum date to exactly 3 days in the future
  const getThreeDaysOutDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  };
 
  const pricePerHour = 65; // Updated rate to $65 as requested
  const totalPrice = parseInt(formData.hours) * pricePerHour;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: null, text: '' });

    // Client-side validations
    if (!formData.date) {
      setStatus({ type: 'error', text: 'Please select an excursion date.' });
      setSubmitting(false);
      return;
    }
    if (!formData.pickupLocation.trim()) {
      setStatus({ type: 'error', text: 'Please specify a pickup location.' });
      setSubmitting(false);
      return;
    }

    try {
      // Send mock booking post
      const payload = {
        rental_duration: null,
        pole_quantity: null,
        guide_booked: true,
        guide_hours: parseInt(formData.hours),
        guide_date: formData.date,
        // Combined guide details in the location field for perfect backwards-compatibility
        guide_pickup_location: `Guide: ${formData.guideName} | Time: ${formData.startTime} | Pickup: ${formData.pickupLocation}`,
        damage_agreement: true, // Auto-agree for guides
        total_price: totalPrice,
        payment_status: 'paid', // Auto paid on checkout
        status: 'confirmed'
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete guided charter booking');
      }

      setStatus({
        type: 'success',
        text: 'Your Guided Charter has been reserved successfully! Booking code generated. Redirecting to your profile...'
      });

      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 2500);

    } catch (error) {
      console.error('Booking submission error:', error);
      setStatus({ type: 'error', text: error.message || 'Failed to process booking. Please try again.' });
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) !important;
          cursor: pointer;
        }
      `}</style>
      {status.text && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 ${
            status.type === 'success'
              ? 'bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-[#00B5AD]'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {status.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{status.text}</span>
        </div>
      )}

      {/* Choose Guide & Excursion Start Time Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#00B5AD]" />
            Choose Your Guide
          </label>
          <select
            name="guideName"
            value={formData.guideName}
            onChange={handleChange}
            className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] outline-none"
          >
            <option value="First Available (Assign Best Expert)">First Available (Assign Best Expert)</option>
            {initialGuides && initialGuides.length > 0 ? (
              initialGuides.map((guide) => (
                <option key={guide.id} value={`${guide.name} (${guide.experience || 'Pro Expert'})`}>
                  {guide.name} ({guide.experience || 'Pro Expert'})
                </option>
              ))
            ) : (
              <>
                <option value="Capt. Dan (Shore Cast Master - 15+ Yrs Exp)">Capt. Dan (Shore Cast Master)</option>
                <option value="Sarah (Fly & Wading Pro - 8+ Yrs Exp)">Sarah (Fly & Wading Pro)</option>
                <option value="Marcus (Tarpon Secret Spots - 10+ Yrs Exp)">Marcus (Tarpon Secret Spots)</option>
              </>
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#00B5AD]" />
            Select Start Time
          </label>
          <select
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] outline-none"
          >
            <option value="06:00 AM">06:00 AM (Early Cast)</option>
            <option value="07:00 AM">07:00 AM</option>
            <option value="08:00 AM">08:00 AM</option>
            <option value="09:00 AM">09:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="12:00 PM">12:00 PM</option>
            <option value="01:00 PM">01:00 PM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="03:00 PM">03:00 PM (Sunset Cast)</option>
          </select>
        </div>
      </div>

      {/* Date & Hours Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#00B5AD]" />
            Charter Date (Min 3-Days Advance Notice)
          </label>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            min={getThreeDaysOutDate()}
            className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#00B5AD]" />
            Duration (Hours - $65/Hr)
          </label>
          <select
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] outline-none"
          >
            <option value="1">1 Hour Excursion</option>
            <option value="2">2 Hours Excursion</option>
            <option value="3">3 Hours Excursion</option>
            <option value="4">4 Hours Excursion</option>
            <option value="5">5 Hours Excursion</option>
            <option value="6">6 Hours Excursion (Half Day)</option>
            <option value="7">7 Hours Excursion</option>
            <option value="8">8 Hours Excursion (Full Day)</option>
            <option value="9">9 Hours Excursion</option>
            <option value="10">10 Hours Excursion</option>
            <option value="11">11 Hours Excursion</option>
            <option value="12">12 Hours Excursion</option>
          </select>
        </div>
      </div>

      {/* Pickup Location */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#00B5AD]" />
          Pick-Up & Drop-Off Address
        </label>
        <input
          type="text"
          name="pickupLocation"
          required
          value={formData.pickupLocation}
          onChange={handleChange}
          placeholder="Red Hook (Default pick up & drop off point)"
          className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
        />
        <span className="block text-[13px] text-[#00B5AD] font-extrabold tracking-wide mt-1">
          *Roundtrip private transit from Red Hook to St. Thomas hot shorelines is completely free and included!
        </span>
      </div>

      {/* Secure simulated card credentials */}
      <div className="border-t border-[#00B5AD]/10 pt-4 space-y-4">
        <span className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-[#00B5AD]" />
          Simulated Payment Checkout (Visa / Mastercard)
        </span>

        <div className="space-y-3.5 p-4 rounded-xl bg-[#001418]/60 border border-[#00B5AD]/10">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">Cardholder Name</label>
            <input
              type="text"
              name="cardName"
              required
              value={formData.cardName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-3 py-2.5 text-xs text-[#FFFFFF]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                required
                maxLength="16"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="4111 2222 3333 4444"
                className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-3 py-2.5 text-xs text-[#FFFFFF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">CVC</label>
              <input
                type="text"
                name="cardCvc"
                required
                maxLength="3"
                value={formData.cardCvc}
                onChange={handleChange}
                placeholder="321"
                className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-3 py-2.5 text-xs text-[#FFFFFF]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Summary & Checkout CTA */}
      <div className="border-t border-[#00B5AD]/10 pt-4 flex items-center justify-between gap-4">
        <div>
          <span className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">Excursion Total ($65/Hr)</span>
          <span className="text-[#00B5AD] text-2xl font-black font-['Outfit']">${totalPrice}.00</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1.5 bg-[#00B5AD] hover:bg-[#00A39E] disabled:bg-[#00B5AD]/50 text-[#FFFFFF] text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-lg shadow-[#00B5AD]/15 transition-all hover:scale-105 cursor-pointer"
        >
          {submitting ? 'Confirming...' : 'Authorize & Reserve'}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
}
