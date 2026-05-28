'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, MapPin, CreditCard, CheckCircle, ArrowRight, User, Sparkles } from 'lucide-react';

export default function GuideBookingForm({ session, initialGuides = [] }) {
  const [formData, setFormData] = useState({
    date: '',
    hours: '2',
    guideName: 'First Available (Assign Best Expert)',
    startTime: '08:00 AM',
    pickupLocation: '',
    referredBy: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, text: '' });
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState('paypal'); // 'card' or 'paypal'
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
 
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
  const baseTotal = parseInt(formData.hours) * pricePerHour;
  const hasReferral = !!formData.referredBy.trim();
  const totalPrice = hasReferral ? Math.max(0, baseTotal - 10) : baseTotal;

  // Dynamic PayPal SDK Loader
  React.useEffect(() => {
    if (paymentMethod !== 'paypal') return;

    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setPaypalError('PayPal Client ID is not configured.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => setPaypalError('Failed to load PayPal SDK.');
    document.body.appendChild(script);
  }, [paymentMethod]);

  // PayPal Buttons Render Effect
  React.useEffect(() => {
    if (!paypalLoaded || paymentMethod !== 'paypal') return;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    // Clean previous buttons if any to avoid duplicate button rendering
    container.innerHTML = '';

    try {
      window.paypal.Buttons({
        onClick: (data, actions) => {
          setStatus({ type: null, text: '' });
          if (!formData.date) {
            setStatus({ type: 'error', text: 'Please select an excursion date.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return actions.reject();
          }
          if (!formData.pickupLocation.trim()) {
            setStatus({ type: 'error', text: 'Please specify a pickup location.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return actions.reject();
          }
          return actions.resolve();
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: totalPrice.toFixed(2)
              },
              description: `Guided Charter: ${formData.guideName} (${formData.hours} Hours)`
            }]
          });
        },
        onApprove: async (data, actions) => {
          setSubmitting(true);
          try {
            const details = await actions.order.capture();
            const orderId = details.id;
            // Complete booking via API
            await completePayPalBooking(orderId);
          } catch (err) {
            console.error('PayPal capture error:', err);
            setStatus({ type: 'error', text: 'PayPal capture failed. Please contact support.' });
            setSubmitting(false);
          }
        },
        onError: (err) => {
          console.error('PayPal payment error:', err);
          setStatus({ type: 'error', text: 'PayPal transaction failed. Please try again.' });
        },
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 45
        }
      }).render('#paypal-button-container');
    } catch (e) {
      console.error('Failed to render PayPal Buttons:', e);
    }
  }, [paypalLoaded, paymentMethod, totalPrice, formData.guideName, formData.hours]);

  const completePayPalBooking = async (orderId) => {
    setStatus({ type: null, text: '' });
    try {
      const payload = {
        rental_duration: null,
        pole_quantity: null,
        guide_booked: true,
        guide_hours: parseInt(formData.hours),
        guide_date: formData.date,
        guide_pickup_location: `Guide: ${formData.guideName} | Time: ${formData.startTime} | Pickup: ${formData.pickupLocation}`,
        damage_agreement: true,
        total_price: totalPrice,
        payment_status: 'paid',
        status: 'confirmed',
        paypal_order_id: orderId,
        payment_method: 'paypal',
        referred_by: formData.referredBy.trim() || null,
        referral_discount: hasReferral ? 10.00 : 0.00
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record booking transaction');
      }

      setStatus({
        type: 'success',
        text: 'Your Guided Charter has been reserved successfully via PayPal! Booking code generated. Redirecting to your profile...'
      });

      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 2500);
    } catch (error) {
      console.error('Booking submission error:', error);
      setStatus({ type: 'error', text: error.message || 'Failed to process booking. Please contact support.' });
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
          Pick-Up &amp; Drop-Off Address
        </label>
        <input
          type="text"
          name="pickupLocation"
          required
          value={formData.pickupLocation}
          onChange={handleChange}
          placeholder="Enter your hotel, resort or address (e.g. Sapphire Beach Resort, Marriott, Red Hook)"
          className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
        />
        <span className="block text-[13px] text-[#00B5AD] font-extrabold tracking-wide mt-1">
          *Roundtrip private transit from Red Hook to St. Thomas hot shorelines is completely free and included!
        </span>
      </div>

      {/* Referral Input Box */}
      <div className="space-y-2 p-4 rounded-xl border border-[#00B5AD]/15 bg-[#001418]/60 shadow-lg shadow-black/30">
        <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00B5AD]" />
          Company / Name Referred By (Optional)
        </label>
        <input
          type="text"
          name="referredBy"
          value={formData.referredBy}
          onChange={handleChange}
          placeholder="Who referred you? (e.g. Sapphire Beach Resort, John Doe)"
          className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
        />
        {hasReferral && (
          <div className="text-xs font-extrabold text-[#00B5AD] flex items-center gap-1.5 animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle className="w-4 h-4 text-[#00B5AD] flex-shrink-0" />
            <span>🎉 Referral Applied: -$10.00 discount applied to your excursion total!</span>
          </div>
        )}
      </div>

      {/* Official PayPal Checkout Container */}
      <div className="border-t border-[#00B5AD]/10 pt-4 space-y-3">
        <span className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">
          Payment Method: PayPal Secure Checkout
        </span>
        <div className="space-y-4 p-5 rounded-xl border border-[#00B5AD]/15 bg-[#001418]/60 text-center relative min-h-[120px] flex flex-col justify-center">
          {paypalError ? (
            <span className="text-red-500 font-bold text-xs">{paypalError}</span>
          ) : !paypalLoaded ? (
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-[#00B5AD] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#A0ACB3] font-semibold">Loading secure PayPal portal...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="block text-xs text-[#A0ACB3] font-semibold mb-2">
                Authorize payment securely via official PayPal window below:
              </span>
              <div id="paypal-button-container" className="w-full max-w-sm mx-auto z-40 relative" />
            </div>
          )}
        </div>
      </div>

      {/* Pricing Summary & Checkout CTA */}
      <div className="border-t border-[#00B5AD]/10 pt-4 flex items-center justify-between gap-4">
        <div>
          <span className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">Excursion Total ($65/Hr)</span>
          <span className="text-[#00B5AD] text-2xl font-black font-['Outfit']">${totalPrice}.00</span>
        </div>

        <div className="text-[11px] text-[#A0ACB3] font-extrabold text-right">
          Click <span className="text-[#00B5AD]">PayPal</span> button above to complete booking.
        </div>
      </div>
    </form>
  );
}
