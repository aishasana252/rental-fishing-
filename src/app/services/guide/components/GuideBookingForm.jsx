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

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'paypal'
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
  const totalPrice = parseInt(formData.hours) * pricePerHour;

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
        payment_method: 'paypal'
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

      {/* Payment Method Selector */}
      <div className="border-t border-[#00B5AD]/10 pt-4 space-y-3">
        <span className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">
          Select Payment Method
        </span>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              paymentMethod === 'card'
                ? 'border-[#00B5AD] bg-[#00B5AD]/15 text-white shadow-md shadow-[#00B5AD]/10'
                : 'border-[#00B5AD]/10 bg-[#001418]/60 text-[#A0ACB3] hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Credit Card (Simulated)
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              paymentMethod === 'paypal'
                ? 'border-[#00B5AD] bg-[#00B5AD]/15 text-white shadow-md shadow-[#00B5AD]/10'
                : 'border-[#00B5AD]/10 bg-[#001418]/60 text-[#A0ACB3] hover:text-white'
            }`}
          >
            <span className="text-[#00B5AD] font-black italic">Pay</span><span className="text-[#00B5AD] opacity-80 font-black italic">Pal</span> (Sandbox)
          </button>
        </div>
      </div>

      {/* Secure simulated card credentials */}
      {paymentMethod === 'card' && (
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
                required={paymentMethod === 'card'}
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
                  required={paymentMethod === 'card'}
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
                  required={paymentMethod === 'card'}
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
      )}

      {/* Official PayPal Checkout Container */}
      {paymentMethod === 'paypal' && (
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
      )}

      {/* Pricing Summary & Checkout CTA */}
      <div className="border-t border-[#00B5AD]/10 pt-4 flex items-center justify-between gap-4">
        <div>
          <span className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">Excursion Total ($65/Hr)</span>
          <span className="text-[#00B5AD] text-2xl font-black font-['Outfit']">${totalPrice}.00</span>
        </div>

        {paymentMethod === 'card' ? (
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 bg-[#00B5AD] hover:bg-[#00A39E] disabled:bg-[#00B5AD]/50 text-[#FFFFFF] text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-lg shadow-[#00B5AD]/15 transition-all hover:scale-105 cursor-pointer"
          >
            {submitting ? 'Confirming...' : 'Authorize & Reserve'}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="text-[11px] text-[#A0ACB3] font-extrabold text-right">
            Click <span className="text-[#00B5AD]">PayPal</span> button above to complete booking.
          </div>
        )}
      </div>
    </form>
  );
}
