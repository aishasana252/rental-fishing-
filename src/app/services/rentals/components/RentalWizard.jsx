'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ChevronRight, ChevronLeft, ShieldCheck, AlertCircle, CreditCard, Sparkles, CheckSquare, Square, Info, X, CheckCircle } from 'lucide-react';

export default function RentalWizard({ session, initialLures, initialDamagePolicies, initialGeneralImages, initialGalleryImages, initialGuides }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [activeLightboxPolicy, setActiveLightboxPolicy] = useState(null);

  // STEP 1 STATE: Gear Selection
  const [duration, setDuration] = useState('3'); // '1', '2', '3' days

  const guideInclusions = [
    'Personal transportation to St. Thomas hot shorelines',
    'Premium shore rod & loaded tacklebox gear included',
    'Ethical guidance & casting/rigging instruction',
    'Keep your catches to cook at partnered restaurants!',
    'Mouthwatering cold bottled island waters provided'
  ];

  // Date helper for guide
  const getThreeDaysOutDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  };
  const [poles, setPoles] = useState(1); // 1 to 5 poles
  const [rentalDate, setRentalDate] = useState(''); // adult rental start date
  const [childPoles, setChildPoles] = useState(0); // 0 to 5 children poles
  const [childRentalDate, setChildRentalDate] = useState(''); // child rental start date
  const [pickupAddress, setPickupAddress] = useState(''); // pickup/dropoff address — kept in state for potential future use

  // Gallery images from admin
  const galleryImages = Array.isArray(initialGalleryImages) ? initialGalleryImages : [];

  // STEP 2 STATE: Lures Add-ons (loaded dynamically from database/props)
  const [lures, setLures] = useState(() => {
    if (initialLures !== undefined && initialLures !== null) {
      return initialLures.map(l => ({
        id: l.id,
        name: l.name,
        price: parseFloat(l.price),
        quantity: 0,
        image: l.image_url || '/assets/logo 1.jpeg'
      }));
    }
    // Fallback static defaults just in case
    return [
      { id: 1, name: 'Crystal Minnow', price: 17.50, quantity: 0, image: '/assets/logo 1.jpeg' },
      { id: 2, name: 'Dons Potbelly', price: 4.99, quantity: 0, image: '/assets/logo 1.jpeg' },
      { id: 3, name: 'Storm Shad (3 pack)', price: 9.63, quantity: 0, image: '/assets/logo 1.jpeg' },
      { id: 4, name: 'Lure Pic 4', price: 6.20, quantity: 0, image: '/assets/logo 1.jpeg' },
      { id: 5, name: 'Fins Minnie', price: 12.50, quantity: 0, image: '/assets/logo 1.jpeg' },
      { id: 6, name: 'Popper', price: 13.65, quantity: 0, image: '/assets/logo 1.jpeg' }
    ];
  });

  // STEP 3 STATE: Damage Policy
  const [damageAgreed, setDamageAgreed] = useState(false);

  // Dynamic Damage Policies
  const policiesList = initialDamagePolicies !== undefined && initialDamagePolicies !== null
    ? initialDamagePolicies
    : [
        { id: 1, name: 'Broken Pole', price: 50.00, image_url: '' },
        { id: 2, name: 'Strung Reel', price: 50.00, image_url: '' },
        { id: 3, name: 'Broken Eye', price: 50.00, image_url: '' },
        { id: 4, name: 'Broken Tacklebox shell', price: 25.00, image_url: '' },
        { id: 5, name: 'Lost rigging Pliers', price: 10.00, image_url: '' },
        { id: 6, name: 'Late Return (Over 1 Hour past window)', price: 100.00, image_url: '' }
      ];

  // STEP 4 STATE: Guide Setup
  const [guideBooked, setGuideBooked] = useState(false);
  const [guideDate, setGuideDate] = useState('');
  const [guideHours, setGuideHours] = useState('2');
  const [guideStartTime, setGuideStartTime] = useState('08:00 AM');
  const [guidePickupLocation, setGuidePickupLocation] = useState('');
  const [guideDropoffLocation, setGuideDropoffLocation] = useState('');

  // STEP 5 STATE: Payment Checkout
  const [checkoutForm, setCheckoutForm] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: null, text: '' });

  const [paymentMethod, setPaymentMethod] = useState('paypal'); // 'card' or 'paypal'
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [referredBy, setReferredBy] = useState('');

  // --- AVAILABILITY LOGIC ---
  const [bookedSlots, setBookedSlots] = useState([]);

  React.useEffect(() => {
    if (guideDate && guideBooked) {
      fetch(`/api/bookings/guide-availability?date=${guideDate}`)
        .then(res => res.json())
        .then(data => {
          if (data.slots) setBookedSlots(data.slots);
        })
        .catch(err => console.error('Error fetching guide availability:', err));
    } else {
      setBookedSlots([]);
    }
  }, [guideDate, guideBooked]);

  const ALL_START_TIMES = [
    { label: "06:00 AM (Early Cast)", value: "06:00 AM" },
    { label: "07:00 AM", value: "07:00 AM" },
    { label: "08:00 AM", value: "08:00 AM" },
    { label: "09:00 AM", value: "09:00 AM" },
    { label: "10:00 AM", value: "10:00 AM" },
    { label: "12:00 PM", value: "12:00 PM" },
    { label: "01:00 PM", value: "01:00 PM" },
    { label: "02:00 PM", value: "02:00 PM" },
    { label: "03:00 PM (Sunset Cast)", value: "03:00 PM" }
  ];

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (hours === 12 && modifier === 'AM') hours = 0;
    if (hours < 12 && modifier === 'PM') hours += 12;
    return hours + (parseInt(minutes || '0', 10) / 60);
  };

  const isTimeAvailable = (startTimeStr, requestedDurationStr) => {
    const requestedStart = parseTime(startTimeStr);
    const requestedDuration = parseInt(requestedDurationStr, 10);
    const requestedEnd = requestedStart + requestedDuration;

    for (const slot of bookedSlots) {
      const bookedStart = parseTime(slot.startTime);
      const bookedEnd = bookedStart + parseInt(slot.duration, 10);
      
      // Add 1 hour buffer before and after the existing booking
      const paddedBookedStart = bookedStart - 1;
      const paddedBookedEnd = bookedEnd + 1;
      
      // Overlap condition using padded boundaries:
      if (requestedStart < paddedBookedEnd && requestedEnd > paddedBookedStart) {
        return false;
      }
    }
    return true;
  };

  React.useEffect(() => {
    // If the currently selected time is now unavailable due to date or duration change, find a new one
    if (guideBooked && guideDate && bookedSlots.length > 0) {
      if (!isTimeAvailable(guideStartTime, guideHours)) {
        const firstAvailable = ALL_START_TIMES.find(t => isTimeAvailable(t.value, guideHours));
        if (firstAvailable) {
          setGuideStartTime(firstAvailable.value);
        } else {
          setGuideStartTime(''); // None available
        }
      }
    }
  }, [bookedSlots, guideHours, guideBooked, guideDate]);

  // --- CALCULATION LOGIC ---
  const durationDays = parseInt(duration);
  // Gear base rate based on new pricing models: flat $50 per day
  const adultBaseRate = durationDays * 50;
  const gearPrice = poles * adultBaseRate;

  // Children's pole price ($35 one-time/flat fee)
  const childPoleRate = 35;
  const childPolesPrice = childPoles * childPoleRate;

  // Total gear rental price
  const totalGearPrice = gearPrice + childPolesPrice;

  // Lures Total
  const luresPrice = lures.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Security Deposit Calculation (Flat fee)
  const securityDeposit = 100.00;

  // Guide Price
  const guidePricePerHour = 65;
  const guidePrice = guideBooked ? parseInt(guideHours) * guidePricePerHour : 0;

  // Total Excursion Booking Price
  const baseTotalPrice = totalGearPrice + luresPrice + securityDeposit + guidePrice;
  const hasReferral = !!referredBy.trim();
  const totalPrice = baseTotalPrice;

  // --- QUANTITY HANDLERS ---
  const handleLureQty = (id, change) => {
    setLures((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, Math.min(5, item.quantity + change));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleCheckoutChange = (e) => {
    setCheckoutForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- ACTION NAVIGATION ---
  const nextStep = () => {
    if (step === 1 && !rentalDate) {
      alert('Please select an adult gear rental start date on the calendar.');
      return;
    }
    if (step === 1 && childPoles > 0 && !childRentalDate) {
      alert("Please select a rental start date for the children's fishing poles on the calendar.");
      return;
    }
    if (step === 3 && !damageAgreed) {
      alert('You must accept the damage policy before proceeding to charter selection.');
      return;
    }
    if (step === 4 && guideBooked) {
      if (!guideDate) {
        alert('Please select an excursion date for your guided charter.');
        return;
      }
      if (!guidePickupLocation.trim() || !guideDropoffLocation.trim()) {
        alert('Please specify both pick up and drop off addresses for the charter.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const completePayPalBooking = async (orderId) => {
    setSubmitting(true);
    setStatusMsg({ type: null, text: '' });

    if (!session) {
      setStatusMsg({ type: 'error', text: 'You must have a logged-in account to complete transactions.' });
      setSubmitting(false);
      return;
    }

    if (!rentalDate) {
      setStatusMsg({ type: 'error', text: 'Please select an adult gear rental start date.' });
      setSubmitting(false);
      return;
    }

    if (childPoles > 0 && !childRentalDate) {
      setStatusMsg({ type: 'error', text: "Please select a rental start date for the children's fishing poles." });
      setSubmitting(false);
      return;
    }

    try {
      const selectedLures = lures
        .filter((l) => l.quantity > 0)
        .map((l) => ({
          id: l.id,
          name: l.name,
          price: l.price,
          quantity: l.quantity
        }));

      const payload = {
        rental_duration: durationDays,
        pole_quantity: poles,
        guide_booked: guideBooked,
        guide_hours: guideBooked ? parseInt(guideHours) : null,
        guide_date: guideBooked ? guideDate : null,
        guide_pickup_location: guideBooked ? `Guide: Assigned Best Expert | Time: ${guideStartTime} | Pickup: ${guidePickupLocation} | Drop-off: ${guideDropoffLocation}` : null,
        damage_agreement: damageAgreed,
        total_price: totalPrice,
        security_added: securityDeposit,
        payment_status: 'paid',
        status: 'confirmed',
        rental_date: rentalDate,
        child_pole_quantity: childPoles,
        child_pole_date: childRentalDate || null,
        selectedLures,
        paypal_order_id: orderId,
        payment_method: 'paypal',
        referred_by: referredBy.trim() || null,
        referral_discount: 0.00,
        pickup_address: null
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete gear rental booking.');
      }

      // Clear localStorage state upon successful checkout
      localStorage.removeItem('rental_step');
      localStorage.removeItem('rental_duration');
      localStorage.removeItem('rental_poles');
      localStorage.removeItem('rental_damage_agreed');
      localStorage.removeItem('rental_lures');
      localStorage.removeItem('rental_date');
      localStorage.removeItem('rental_child_poles');
      localStorage.removeItem('rental_child_date');
      localStorage.removeItem('rental_referred_by');

      setStatusMsg({
        type: 'success',
        text: 'Success! Your premium fishing gear rental has been confirmed via PayPal. Redirecting to your dashboard...'
      });

      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 2500);

    } catch (error) {
      console.error('Checkout error:', error);
      setStatusMsg({ type: 'error', text: error.message || 'An unexpected error occurred.' });
      setSubmitting(false);
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
  };

  // --- LOCALSTORAGE PERSISTENCE ---
  // Load state on mount to prevent Next.js hydration mismatch
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('reset=true')) {
      localStorage.removeItem('rental_step');
      localStorage.removeItem('rental_duration');
      localStorage.removeItem('rental_poles');
      localStorage.removeItem('rental_damage_agreed');
      localStorage.removeItem('rental_lures');
      localStorage.removeItem('rental_date');
      localStorage.removeItem('rental_child_poles');
      localStorage.removeItem('rental_child_date');
      localStorage.removeItem('rental_referred_by');
      setStep(1);
      return;
    }

    const savedStep = localStorage.getItem('rental_step');
    if (savedStep) setStep(parseInt(savedStep, 10));

    const savedDuration = localStorage.getItem('rental_duration');
    if (savedDuration) setDuration(savedDuration);

    const savedPoles = localStorage.getItem('rental_poles');
    if (savedPoles) setPoles(parseInt(savedPoles, 10));

    const savedDamageAgreed = localStorage.getItem('rental_damage_agreed');
    if (savedDamageAgreed) setDamageAgreed(savedDamageAgreed === 'true');

    const savedRentalDate = localStorage.getItem('rental_date');
    if (savedRentalDate) setRentalDate(savedRentalDate);

    const savedChildPoles = localStorage.getItem('rental_child_poles');
    if (savedChildPoles) setChildPoles(parseInt(savedChildPoles, 10));

    const savedChildRentalDate = localStorage.getItem('rental_child_date');
    if (savedChildRentalDate) setChildRentalDate(savedChildRentalDate);

    const savedReferredBy = localStorage.getItem('rental_referred_by');
    if (savedReferredBy) setReferredBy(savedReferredBy);

    const savedLures = localStorage.getItem('rental_lures');
    if (savedLures) {
      try {
        const parsedLures = JSON.parse(savedLures);
        setLures((current) =>
          current.map((item) => {
            const savedItem = parsedLures.find((p) => p.id === item.id);
            return savedItem ? { ...item, quantity: savedItem.quantity } : item;
          })
        );
      } catch (e) {
        console.error('Failed to restore saved lures:', e);
      }
    }
  }, []);

  // Save states to localStorage when changed
  React.useEffect(() => {
    localStorage.setItem('rental_step', step.toString());
  }, [step]);

  React.useEffect(() => {
    localStorage.setItem('rental_duration', duration);
  }, [duration]);

  React.useEffect(() => {
    localStorage.setItem('rental_poles', poles.toString());
  }, [poles]);

  React.useEffect(() => {
    localStorage.setItem('rental_damage_agreed', damageAgreed.toString());
  }, [damageAgreed]);

  React.useEffect(() => {
    localStorage.setItem('rental_date', rentalDate);
  }, [rentalDate]);

  React.useEffect(() => {
    localStorage.setItem('rental_child_poles', childPoles.toString());
  }, [childPoles]);

  React.useEffect(() => {
    localStorage.setItem('rental_child_date', childRentalDate);
  }, [childRentalDate]);

  React.useEffect(() => {
    localStorage.setItem('rental_lures', JSON.stringify(lures.map((l) => ({ id: l.id, quantity: l.quantity }))));
  }, [lures]);

  React.useEffect(() => {
    localStorage.setItem('rental_referred_by', referredBy);
  }, [referredBy]);

  // Dynamic PayPal SDK Loader
  React.useEffect(() => {
    if (step !== 5 || paymentMethod !== 'paypal') return;

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
  }, [paymentMethod, step]);

  // PayPal Buttons Render Effect
  React.useEffect(() => {
    if (!paypalLoaded || paymentMethod !== 'paypal' || step !== 5) return;

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
              description: `Fishing Gear (${durationDays} Days) ${guideBooked ? '+ Charter' : ''}`
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
            setStatusMsg({ type: 'error', text: 'PayPal capture failed. Please contact support.' });
            setSubmitting(false);
          }
        },
        onError: (err) => {
          console.error('PayPal payment error:', err);
          setStatusMsg({ type: 'error', text: 'PayPal transaction failed. Please try again.' });
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
  }, [paypalLoaded, paymentMethod, step, totalPrice, poles, childPoles, durationDays]);



  return (
    <div className="space-y-10">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) !important;
          cursor: pointer;
        }
      `}</style>
      
      {/* RENTAL PHOTO GALLERY - Admin Uploaded Images */}
      {galleryImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="block text-[10px] font-black text-[#6B7A82] uppercase tracking-widest">Our Rental Equipment</span>
            <div className="flex-1 h-px bg-[#00B5AD]/10" />
          </div>
          <div className={`grid gap-3 ${galleryImages.length === 1 ? 'grid-cols-1' : galleryImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {galleryImages.map((img, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#00B5AD]/15 bg-[#001418] aspect-video shadow-lg shadow-black/30">
                <img
                  src={img.url}
                  alt={img.caption || `Rental gear ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#001418]/90 to-transparent px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[10px] font-bold text-[#00B5AD] uppercase tracking-wider">{img.caption}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. VISUAL STEP INDICATOR */}
      <div className="flex justify-between items-center max-w-xl mx-auto border-b border-[#00B5AD]/10 pb-6">
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full font-black flex items-center justify-center text-xs transition-all duration-300 ${
                step === num
                  ? 'bg-[#00B5AD] text-[#FFFFFF] shadow-[0_0_12px_#00B5AD]'
                  : step > num
                  ? 'bg-[#04282F] text-[#00B5AD] border border-[#00B5AD]/30'
                  : 'bg-[#001418] text-[#3B4E5A] border border-[#3B4E5A]/25'
              }`}
            >
              {num}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                step === num ? 'text-[#00B5AD]' : 'text-[#6B7A82]'
              }`}
            >
              {num === 1 ? 'Rental' : num === 2 ? 'Lures' : num === 3 ? 'Policy' : 'Pay'}
            </span>
            {num < 4 && <div className="h-0.5 w-8 bg-[#3B4E5A]/20 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* 2. DYNAMIC WIZARD SCREENS */}

      {/* STEP 1: RENTAL SELECTION PAGE */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            
            {/* Toggle Duration */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold uppercase tracking-wider font-['Outfit',sans-serif] text-[#FFFFFF]">
                1. Select Rental
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '1', label: '1 Day', desc: '$50 total / pole' },
                  { value: '2', label: '2 Days', desc: '$100 total / pole' },
                  { value: '3', label: '3 Days', desc: '$150 total / pole' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDuration(item.value)}
                    className={`p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                      duration === item.value
                        ? 'border-[#00B5AD] bg-[#00B5AD]/10 text-[#00B5AD] shadow-[0_4px_10px_rgba(0,181,173,0.15)]'
                        : 'border-[#00B5AD]/10 bg-[#04282F]/30 hover:border-[#00B5AD]/30 text-[#A0ACB3]'
                    }`}
                  >
                    <span className="block font-black text-sm uppercase">{item.label}</span>
                    <span className="block text-[9px] font-bold text-[#6B7A82] mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Quantity */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold uppercase tracking-wider font-['Outfit',sans-serif] text-[#FFFFFF]">
                2. Select Pole Quantity
              </h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPoles(num)}
                    className={`flex-grow py-3 rounded-lg border text-center font-extrabold text-sm transition-all duration-200 cursor-pointer ${
                      poles === num
                        ? 'border-[#00B5AD] bg-[#00B5AD]/15 text-[#00B5AD]'
                        : 'border-[#00B5AD]/10 bg-[#04282F]/30 hover:border-[#00B5AD]/25 text-[#A0ACB3]'
                    }`}
                  >
                    {num} {num === 1 ? 'Pole' : 'Poles'}
                  </button>
                ))}
              </div>
              
              {/* Rental Date Picker for Adult rentals */}
              <div className="space-y-2 p-4 rounded-xl border border-[#00B5AD]/15 bg-[#001418]/60 mt-3">
                <label className="block text-xs font-bold text-[#A0ACB3] uppercase tracking-wider">
                  Select Rental Start Date
                </label>
                <input
                  type="date"
                  required
                  value={rentalDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRentalDate(e.target.value)}
                  className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-white outline-none"
                />
                {rentalDate && (
                  <p className="text-[11px] font-bold text-[#00B5AD] mt-1 leading-none">
                    Rental Period: {new Date(rentalDate).toLocaleDateString()} to {
                      (() => {
                        const d = new Date(rentalDate);
                        d.setDate(d.getDate() + durationDays - 1);
                        return d.toLocaleDateString();
                      })()
                    } ({durationDays} {durationDays === 1 ? 'Day' : 'Days'})
                  </p>
                )}
              </div>

              <p className="text-[13px] font-extrabold text-[#FF4D4D] flex items-center gap-1.5 pt-1 mt-1.5 leading-relaxed">
                <Info className="w-4 h-4 text-[#FF4D4D] flex-shrink-0" />
                *Each fishing pole automatically includes a deluxe tacklebox and heavy-duty 30 lb test fishing line.
              </p>
            </div>

            {/* Children's Fishing Pole Add-on Option */}
            <div className="space-y-4 p-5 rounded-xl border border-[#00B5AD]/15 bg-[#04282F]/20">
              <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit',sans-serif] text-white flex items-center gap-2">
                Children's Fishing Pole Add-on
              </h3>
              <p className="text-xs text-[#A0ACB3] font-semibold leading-relaxed">
                Add premium children's fishing poles for just <span className="text-[#00B5AD] font-bold">$35 flat one-time fee</span>. Maximum 5-day rental limit!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Quantity Toggle */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#6B7A82] uppercase tracking-wider">
                    Quantity (Children Poles)
                  </label>
                  <select
                    value={childPoles}
                    onChange={(e) => setChildPoles(parseInt(e.target.value))}
                    className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value={0}>0 Poles (None)</option>
                    <option value={1}>1 Children Pole ($35)</option>
                    <option value={2}>2 Children Poles ($70)</option>
                    <option value={3}>3 Children Poles ($105)</option>
                    <option value={4}>4 Children Poles ($140)</option>
                    <option value={5}>5 Children Poles ($175)</option>
                  </select>
                </div>

                {/* Calendar Date for Children Poles */}
                {childPoles > 0 && (
                  <div className="space-y-1.5 animate-[fadeIn_0.3s_ease-out]">
                    <label className="block text-[10px] font-black text-[#6B7A82] uppercase tracking-wider">
                      Select Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={childRentalDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setChildRentalDate(e.target.value)}
                      className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-3 py-2 text-white outline-none"
                    />
                    {childRentalDate && (
                      <p className="text-[9px] font-bold text-[#00B5AD] leading-none mt-1">
                        Rental Period: {new Date(childRentalDate).toLocaleDateString()} to {
                          (() => {
                            const d = new Date(childRentalDate);
                            d.setDate(d.getDate() + 4); // 5-day limit means start + 4 days
                            return d.toLocaleDateString();
                          })()
                        } (5 Day Limit)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tacklebox Inclusions */}
            <div className="p-6 rounded-xl border border-[#FF4D4D]/25 bg-[#25080C]/35 backdrop-blur-sm shadow-lg shadow-[#FF4D4D]/5 space-y-4">
              <h4 className="text-[#FFFFFF] text-xs font-black uppercase tracking-wider border-b border-[#FF4D4D]/15 pb-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FF4D4D] animate-pulse" />
                Included In Your Tacklebox:
              </h4>
              <ul className="grid grid-cols-2 gap-3 text-xs font-semibold text-[#E2E8F0]">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF4D4D]" /> Steel Rigging Pliers
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF4D4D]" /> Two Hook Sizes (Heavy-duty)
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF4D4D]" /> Two Lead Weight Sizes
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF4D4D]" /> Pre-rigged Casting Lures
                </li>
              </ul>
            </div>

          </div>

          {/* Pricing Summary Column */}
          <div className="lg:col-span-5 bg-[#04282F]/20 border border-[#00B5AD]/10 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <h4 className="text-[#FFFFFF] text-sm font-bold uppercase tracking-wider border-b border-[#00B5AD]/15 pb-2">
                Booking Details
              </h4>
              <div className="space-y-3.5 text-xs font-semibold text-[#A0ACB3]">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Adult duration:</span>
                    <span className="text-[#FFFFFF]">{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adult poles quantity:</span>
                    <span className="text-[#FFFFFF]">{poles} {poles === 1 ? 'Pole' : 'Poles'}</span>
                  </div>
                  {rentalDate && (
                    <div className="text-[10px] text-[#00B5AD] text-right font-bold">
                      [{new Date(rentalDate).toLocaleDateString()} to {
                        (() => {
                          const d = new Date(rentalDate);
                          d.setDate(d.getDate() + durationDays - 1);
                          return d.toLocaleDateString();
                        })()
                      }]
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Adult package price:</span>
                    <span className="text-[#FFFFFF]">${gearPrice}.00</span>
                  </div>
                </div>

                {childPoles > 0 && (
                  <div className="space-y-1 border-t border-[#00B5AD]/10 pt-2">
                    <div className="flex justify-between">
                      <span>Children poles quantity:</span>
                      <span className="text-[#FFFFFF]">{childPoles} {childPoles === 1 ? 'Pole' : 'Poles'}</span>
                    </div>
                    {childRentalDate && (
                      <div className="text-[10px] text-[#00B5AD] text-right font-bold">
                        [{new Date(childRentalDate).toLocaleDateString()} to {
                          (() => {
                            const d = new Date(childRentalDate);
                            d.setDate(d.getDate() + 4);
                            return d.toLocaleDateString();
                          })()
                        }]
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Children package price:</span>
                      <span className="text-[#FFFFFF]">${childPolesPrice}.00</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#00B5AD]/10 pt-6 mt-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#6B7A82] uppercase">Package Price</span>
                <span className="text-2xl font-black text-[#00B5AD] font-['Outfit']">${totalGearPrice}.00</span>
              </div>
              <button
                type="button"
                onClick={nextStep}
                className="w-full flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] py-3.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#00B5AD]/15"
              >
                Add Lures Add-ons <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: LURES ADD-ON PAGE */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#00B5AD]/15 pb-4">
            <h3 className="text-lg font-bold uppercase tracking-wider font-['Outfit',sans-serif] text-[#FFFFFF] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00B5AD] animate-pulse" />
              Add Specialized Island Lures
            </h3>
            <span className="text-xs font-bold text-[#6B7A82] uppercase">Optional Add-ons</span>
          </div>

          {/* Frozen Fish / Bait Notice */}
          <div className="p-5 rounded-xl border border-[#FF4D4D]/25 bg-[#25080C]/35 backdrop-blur-sm shadow-lg shadow-[#FF4D4D]/5 flex flex-col sm:flex-row items-center gap-4 text-left">
            <div className="p-3 rounded-full bg-[#001418] border border-[#FF4D4D]/25 flex-shrink-0 text-[#FF4D4D] shadow-md shadow-[#000000]/20 animate-pulse">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-bold text-[#FF4D4D] uppercase tracking-wider">🐟 Local Bait Available in Red Hook</span>
              <p className="text-[13px] text-[#FFFFFF] font-semibold leading-relaxed">
                Need real bait? <strong className="text-[#FF4D4D] font-bold">Frozen fish / bait</strong> is available to purchase directly at <strong className="text-[#FF4D4D] font-bold">Red Hook</strong>!
                It is the perfect addition to pair with your specialized lures for maximum shoreline casting.
              </p>
            </div>
          </div>

          {/* Lures Grid */}
          {lures.length === 0 ? (
            <div className="text-center py-12 px-4 border border-[#00B5AD]/20 rounded-2xl bg-[#04282F]/20 space-y-3 max-w-xl mx-auto shadow-lg shadow-[#00B5AD]/5">
              <ShoppingBag className="w-10 h-10 text-[#00B5AD]/60 mx-auto animate-pulse" />
              <h4 className="text-sm font-extrabold text-[#FFFFFF] uppercase tracking-wider font-['Outfit']">No Add-on Lures Available</h4>
              <p className="text-xs text-[#A0ACB3] font-semibold leading-relaxed max-w-xs mx-auto">
                There are no specialized island lures registered in the catalog right now. Click "Damage Policy" below to proceed directly!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {lures.map((lure) => (
                <div
                  key={lure.id}
                  className="rounded-xl border border-[#00B5AD]/15 bg-[#04282F]/30 overflow-hidden flex flex-col justify-between shadow-md"
                >
                  {/* Lure Image */}
                  <div className="h-52 bg-gradient-to-br from-[#0A424A] to-[#04282F] flex items-center justify-center border-b border-[#00B5AD]/15 relative overflow-hidden">
                    {lure.image ? (
                      <img
                        src={lure.image}
                        alt={lure.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.lure-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="lure-fallback absolute inset-0 flex items-center justify-center bg-black/10" 
                      style={{ display: lure.image ? 'none' : 'flex' }}
                    >
                      <Sparkles className="w-8 h-8 text-[#00B5AD]/80 drop-shadow-[0_0_10px_#00B5AD]" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-[#FFFFFF] text-sm tracking-wide">{lure.name}</h4>
                      <span className="text-[#00B5AD] font-bold text-xs">${lure.price.toFixed(2)}</span>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center justify-between border border-[#00B5AD]/20 rounded-lg p-1.5 bg-[#001418]/60 mt-2">
                      <button
                        type="button"
                        onClick={() => handleLureQty(lure.id, -1)}
                        className="w-7 h-7 rounded-md bg-[#04282F] hover:bg-[#00B5AD]/20 text-[#A0ACB3] hover:text-[#00B5AD] font-black flex items-center justify-center cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold text-[#FFFFFF]">{lure.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleLureQty(lure.id, 1)}
                        className="w-7 h-7 rounded-md bg-[#04282F] hover:bg-[#00B5AD]/20 text-[#A0ACB3] hover:text-[#00B5AD] font-black flex items-center justify-center cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nav Controls */}
          <div className="border-t border-[#00B5AD]/10 pt-6 flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-1 border border-[#6B7A82]/30 text-[#A0ACB3] hover:text-[#FFFFFF] px-5 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">Lures Total</span>
              <span className="text-sm font-extrabold text-[#00B5AD]">${luresPrice.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1 bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] px-6 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md shadow-[#00B5AD]/10"
            >
              Damage Policy <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DAMAGE POLICY PAGE */}
      {step === 3 && (
        <div className="space-y-8">
          <div className="border-b border-[#00B5AD]/15 pb-4 text-center sm:text-left">
            <h3 className="text-lg font-bold uppercase tracking-wider font-['Outfit',sans-serif] text-[#FFFFFF] flex items-center gap-2 justify-center sm:justify-start">
              <AlertCircle className="w-5 h-5 text-[#00B5AD] animate-bounce" />
              Damage & Late Return Policies
            </h3>
            <p className="text-xs text-[#6B7A82] font-semibold mt-1">Please inspect and acknowledge rental damage responsibilities before paying.</p>
          </div>

          {/* Security Deposit Notification Banner */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-8 flex gap-4 items-center animate-[fadeIn_0.4s_ease-out]">
            <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-200 leading-relaxed uppercase tracking-wider">
                <span className="font-black text-red-400">Security Deposit Notification:</span> An amount of <span className="font-black text-white bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">${securityDeposit.toFixed(2)}</span> has been added to your total as a refundable security deposit.
                This will be held securely during your rental. If no damage occurs, it will be fully released. In case of damage, applicable fines will be deducted according to the policies below and the remaining balance released.
              </p>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start overflow-x-hidden p-1">
            
            {/* Visual illustrative blocks dynamically loaded from Database / Admin page */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-4 animate-[slideInRight_0.6s_ease-out]">
              {policiesList.filter(policy => policy.image_url).map((policy) => (
                <div
                  key={policy.id}
                  onClick={() => {
                    if (policy.image_url) {
                      setActiveLightboxPolicy(policy);
                    }
                  }}
                  className={`rounded-xl overflow-hidden border border-[#00B5AD]/10 bg-[#04282F]/40 p-4 space-y-3 text-center shadow-sm flex flex-col items-center justify-center aspect-square relative group select-none ${
                    policy.image_url ? 'cursor-zoom-in hover:border-[#00B5AD]/30 transition-all hover:scale-[1.03] active:scale-[0.98]' : ''
                  }`}
                >
                  {policy.image_url ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={policy.image_url}
                        alt={policy.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  
                  {/* Card Content Container */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/40 px-2 py-0.5 rounded shadow-sm drop-shadow-md">
                      {policy.name}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#00B5AD] bg-[#04282F]/80 px-2 py-1 rounded shadow-sm border border-[#00B5AD]/20">
                      ${parseFloat(policy.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Standalone General Broken Images */}
              {initialGeneralImages && initialGeneralImages.map((imgUrl, idx) => (
                <div
                  key={`general-${idx}`}
                  onClick={() => {
                    setActiveLightboxPolicy({ image_url: imgUrl, name: 'General Broken Gear' });
                  }}
                  className="rounded-xl overflow-hidden border border-[#00B5AD]/10 bg-[#04282F]/40 p-4 space-y-3 text-center shadow-sm flex flex-col items-center justify-center aspect-square relative group select-none cursor-zoom-in hover:border-[#00B5AD]/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={imgUrl}
                      alt="General Broken Gear"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Damage Table */}
            <div className="lg:col-span-7 bg-[#04282F]/30 border border-[#00B5AD]/15 rounded-2xl overflow-x-auto shadow-lg animate-[slideInLeft_0.6s_ease-out]">
              <table className="w-full text-left text-xs font-semibold min-w-[450px] sm:min-w-0">
                <thead className="bg-[#04282F] text-[#FFFFFF] border-b border-[#00B5AD]/25 text-[10px] font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Damage Incident Type</th>
                    <th className="px-4 py-3.5 text-right">Standard Fine Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00B5AD]/10 text-[#A0ACB3]">
                  {policiesList.map((policy) => (
                    <tr key={policy.id} className="hover:bg-[#00B5AD]/5">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        {policy.image_url && (
                          <img
                            src={policy.image_url}
                            alt={policy.name}
                            className="w-6 h-6 rounded-md object-cover border border-[#00B5AD]/20 flex-shrink-0"
                          />
                        )}
                        <span>{policy.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-[#00B5AD] font-extrabold">
                        ${parseFloat(policy.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Controls */}
          <div className="border-t border-[#00B5AD]/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-1 border border-[#6B7A82]/30 text-[#A0ACB3] hover:text-[#FFFFFF] px-5 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {/* Interactive Checkbox signature */}
            <div className="p-4 rounded-xl border border-[#00B5AD]/30 bg-[#00B5AD]/5 flex-1 max-w-xl flex items-start gap-3">
              <button
                type="button"
                onClick={() => setDamageAgreed(!damageAgreed)}
                className="mt-0.5 text-[#00B5AD] hover:scale-105 transition-transform cursor-pointer"
              >
                {damageAgreed ? (
                  <CheckSquare className="w-5 h-5 fill-[#00B5AD] text-[#001418]" />
                ) : (
                  <Square className="w-5 h-5 text-[#00B5AD]/60" />
                )}
              </button>
              <div className="space-y-1 select-none text-left">
                <h5 className="text-xs font-black uppercase text-[#FFFFFF]">Acknowledge Responsibility</h5>
                <p className="text-[11px] font-semibold text-[#A0ACB3] leading-relaxed">
                  I understand and accept full financial responsibility for any damages to the rods, reels, pliers, or tackleboxes, and acknowledge late fee penalties.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={nextStep}
              disabled={!damageAgreed}
              className="flex items-center gap-1 bg-[#00B5AD] hover:bg-[#00A39E] disabled:bg-[#00B5AD]/40 text-[#FFFFFF] px-6 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md shadow-[#00B5AD]/15"
            >
              Proceed to Checkout <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GUIDED CHARTER SETUP */}
      {step === 4 && (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#FFFFFF] font-['Outfit']">
              4. Add a Guided Charter?
            </h3>
            <p className="text-sm text-[#A0ACB3] font-semibold leading-relaxed">
              Don't waste time looking for fish! Add a premium shoreline charter. Our experts will pick you up, take you to the hot spots, and show you exactly how to cast and rig.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Left Side: Pricing & Inclusions */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="p-6 rounded-2xl border border-[#00B5AD]/20 bg-[#04282F]/30 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00B5AD]/5 rounded-full pointer-events-none blur-xl" />
                <span className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">All-Inclusive Rate</span>
                <div className="flex items-baseline gap-1 text-[#00B5AD]">
                  <span className="text-5xl font-black font-['Outfit']">$65</span>
                  <span className="text-lg font-bold text-[#6B7A82]">/ Hour</span>
                </div>
                <p className="text-xs text-[#A0ACB3] font-semibold leading-relaxed">
                  *Full gear, tackle, licenses, and St. Thomas private shoreline transit (with complimentary pickup & drop-off from Red Hook) are 100% covered in the price.
                </p>
              </div>

              {/* Inclusions Checkbox List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-b border-[#00B5AD]/15 pb-2">
                  Excursion Inclusions
                </h3>
                <ul className="space-y-3 text-sm font-semibold text-[#A0ACB3]">
                  {guideInclusions.map((inc, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#00B5AD] flex-shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Side: Form / Toggle */}
            <div className="bg-[#04282F]/30 border border-[#00B5AD]/15 p-6 rounded-2xl shadow-xl space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-[#00B5AD]/15 pb-6">
                  <button
                    type="button"
                    onClick={() => setGuideBooked(!guideBooked)}
                    className="text-[#00B5AD] hover:scale-105 transition-transform cursor-pointer"
                  >
                    {guideBooked ? (
                      <CheckSquare className="w-6 h-6 fill-[#00B5AD] text-[#001418]" />
                    ) : (
                      <Square className="w-6 h-6 text-[#00B5AD]/60" />
                    )}
                  </button>
                  <div className="space-y-1 select-none text-left" onClick={() => setGuideBooked(!guideBooked)}>
                    <h5 className="text-sm font-black uppercase text-[#FFFFFF] cursor-pointer hover:text-[#00B5AD] transition-colors">Yes, include a Guided Shoreline Charter ($65/hr)</h5>
                    <p className="text-xs font-semibold text-[#A0ACB3]">Select this to add expert guidance and private transit to your gear rental!</p>
                  </div>
                </div>

                {guideBooked && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                {/* Date & Hours Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">
                      Charter Date
                    </label>
                    <input
                      type="date"
                      name="guideDate"
                      required
                      value={guideDate}
                      onChange={(e) => setGuideDate(e.target.value)}
                      className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">
                      Duration (Hours - $65/Hr)
                    </label>
                    <select
                      name="guideHours"
                      value={guideHours}
                      onChange={(e) => setGuideHours(e.target.value)}
                      className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] outline-none"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(hr => (
                        <option key={hr} value={hr}>{hr} Hours Excursion {hr===6 ? '(Half Day)' : hr===8 ? '(Full Day)' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Excursion Start Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">
                    Select Start Time
                  </label>
                  <select
                    name="guideStartTime"
                    value={guideStartTime}
                    onChange={(e) => setGuideStartTime(e.target.value)}
                    className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] outline-none"
                  >
                    {ALL_START_TIMES.map((timeOption) => {
                      const available = isTimeAvailable(timeOption.value, guideHours);
                      return (
                        <option 
                          key={timeOption.value} 
                          value={timeOption.value}
                          disabled={!available}
                        >
                          {timeOption.label} {!available ? '(Booked/Unavailable)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Pickup & Dropoff Location */}
                <div className="space-y-3">
                  <span className="block text-[13px] text-[#00B5AD] font-extrabold tracking-wide">
                    Please choose your pick up and drop off address:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">
                        Pick Up Address
                      </label>
                      <input
                        type="text"
                        name="guidePickupLocation"
                        required
                        value={guidePickupLocation}
                        onChange={(e) => setGuidePickupLocation(e.target.value)}
                        placeholder="Where to pick you up?"
                        className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">
                        Drop Off Address
                      </label>
                      <input
                        type="text"
                        name="guideDropoffLocation"
                        required
                        value={guideDropoffLocation}
                        onChange={(e) => setGuideDropoffLocation(e.target.value)}
                        placeholder="Where to drop you off?"
                        className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
                {/* Controls */}
                <div className="border-t border-[#00B5AD]/10 pt-6 flex justify-between items-center gap-4 mt-auto">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-1 border border-[#6B7A82]/30 text-[#A0ACB3] hover:text-[#FFFFFF] px-5 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1 bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] px-6 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md shadow-[#00B5AD]/15"
                  >
                    Proceed to Checkout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: CHECKOUT & PAYMENT PAGE */}
      {step === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Checkout - 7 Columns */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-b border-[#00B5AD]/10 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00B5AD]" />
              PayPal Secure Checkout
            </h3>

            {statusMsg.text && (
              <div
                className={`p-4 rounded-xl text-xs font-bold ${
                  statusMsg.type === 'success'
                    ? 'bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-[#00B5AD]'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                <span>{statusMsg.text}</span>
              </div>
            )}

            {session ? (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                {/* Referral Input Box */}
                <div className="space-y-2 p-4 rounded-xl border border-[#00B5AD]/15 bg-[#001418]/60 shadow-lg shadow-black/30">
                  <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00B5AD]" />
                    Company / Name Referred By (Optional)
                  </label>
                  <input
                    type="text"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    placeholder="Who referred you? (e.g. Sapphire Beach Resort, John Doe)"
                    className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <span className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">
                    Payment Method: PayPal Secure Checkout
                  </span>
                  
                  {/* Official PayPal Checkout Container */}
                  <div className="space-y-4 p-5 rounded-xl border border-[#00B5AD]/15 bg-[#001418]/60 text-center relative min-h-[120px] flex flex-col justify-center animate-[fadeIn_0.3s_ease-out]">
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
                        <div id="paypal-button-container" className="w-full max-w-sm mx-auto z-40 relative animate-[fadeIn_0.3s_ease-out]" />
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={submitting}
                      className="flex items-center gap-1 border border-[#6B7A82]/30 text-[#A0ACB3] hover:text-[#FFFFFF] px-5 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                    >
                      Back
                    </button>
                    <div className="flex-grow flex items-center justify-end text-[11px] text-[#A0ACB3] font-extrabold text-right">
                      Click <span className="text-[#00B5AD]">PayPal</span> button above to complete booking.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border border-[#00B5AD]/10 rounded-2xl bg-[#001418]/40 space-y-4">
                <div className="p-3 bg-[#00B5AD]/10 text-[#00B5AD] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#FFFFFF] uppercase">Authentication Required</h4>
                  <p className="text-xs text-[#6B7A82] mt-1 max-w-xs mx-auto">You must log in or register a new customer account to secure rental packages.</p>
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <Link
                    href="/login?redirect=/services/rentals"
                    className="bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup?redirect=/services/rentals"
                    className="border border-[#00B5AD]/35 text-[#00B5AD] hover:bg-[#00B5AD]/10 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Side Summary - 5 Columns */}
          <div className="lg:col-span-5 bg-[#04282F]/20 border border-[#00B5AD]/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl shadow-[#000000]/25">
            <div className="space-y-5">
              <h4 className="text-[#FFFFFF] text-sm font-bold uppercase tracking-wider border-b border-[#00B5AD]/15 pb-2">
                Booking Summary
              </h4>

              {/* Items Summary list */}
              <div className="space-y-3.5 text-xs font-semibold text-[#A0ACB3]">
                {/* Adult Rental Summary */}
                <div className="space-y-1">
                  <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Adult Gear Rental</span>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-[#FFFFFF]">{durationDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="text-[#FFFFFF]">{poles} {poles === 1 ? 'Pole' : 'Poles'}</span>
                  </div>
                  {rentalDate && (
                    <div className="text-[10px] text-[#00B5AD] font-bold">
                      [{new Date(rentalDate).toLocaleDateString()} to {
                        (() => {
                          const d = new Date(rentalDate);
                          d.setDate(d.getDate() + durationDays - 1);
                          return d.toLocaleDateString();
                        })()
                      }]
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Adult Price:</span>
                    <span className="text-[#FFFFFF]">${gearPrice}.00</span>
                  </div>
                </div>

                {/* Children Pole Summary */}
                {childPoles > 0 && (
                  <div className="space-y-1 border-t border-[#00B5AD]/10 pt-2">
                    <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Children Gear Rental</span>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="text-[#FFFFFF]">{childPoles} {childPoles === 1 ? 'Pole' : 'Poles'}</span>
                    </div>
                    {childRentalDate && (
                      <div className="text-[10px] text-[#00B5AD] font-bold">
                        [{new Date(childRentalDate).toLocaleDateString()} to {
                          (() => {
                            const d = new Date(childRentalDate);
                            d.setDate(d.getDate() + 4);
                            return d.toLocaleDateString();
                          })()
                        }]
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Children Price:</span>
                      <span className="text-[#FFFFFF]">${childPolesPrice}.00</span>
                    </div>
                  </div>
                )}

                {/* Show lures list if any */}
                {lures.some((l) => l.quantity > 0) && (
                  <div className="space-y-2 border-t border-[#00B5AD]/10 pt-2 pb-1">
                    <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Lure Add-ons</span>
                    {lures
                      .filter((l) => l.quantity > 0)
                      .map((l) => (
                        <div key={l.id} className="flex justify-between text-[11px] text-[#A0ACB3]">
                           <span>{l.name} (x{l.quantity})</span>
                           <span className="text-[#FFFFFF]">${(l.price * l.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Show Guided Charter if booked */}
                {guideBooked && (
                  <div className="space-y-1 border-t border-[#00B5AD]/10 pt-2">
                    <span className="block text-[9px] font-bold text-[#6B7A82] uppercase tracking-wider">Guided Shoreline Charter</span>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-[#FFFFFF]">{guideHours} Hours</span>
                    </div>
                    {guideDate && (
                      <div className="text-[10px] text-[#00B5AD] font-bold">
                        [{new Date(guideDate).toLocaleDateString()} at {guideStartTime}]
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Charter Price:</span>
                      <span className="text-[#FFFFFF]">${guidePrice}.00</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-[#00B5AD]/10 pt-2">
                  <span>Damage Agreement:</span>
                  <span className="text-[#00B5AD] uppercase text-[10px]">Acknowledge Signed</span>
                </div>

                <div className="flex justify-between text-[13px] font-black text-red-400 pt-1.5 border-t border-[#00B5AD]/10 pt-2 pb-1">
                  <span>Refundable Security Fee:</span>
                  <span>${securityDeposit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#00B5AD]/10 pt-6 mt-6 flex justify-between items-baseline">
              <span className="text-xs font-extrabold text-[#6B7A82] uppercase tracking-wider">Estimated Total</span>
              <span className="text-3xl font-black text-[#00B5AD] font-['Outfit']">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

        </div>
      )}

      {/* 3. LIGHTBOX MODAL FOR DYNAMIC DAMAGE POLICY IMAGES */}
      {activeLightboxPolicy && (
        <div
          className="fixed top-28 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-[#001418]/95 backdrop-blur-md p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setActiveLightboxPolicy(null)}
        >
          {/* Modal Container */}
          <div
            className="bg-[#04282F]/90 border border-[#00B5AD]/20 max-w-2xl w-full rounded-2xl p-6 sm:p-8 relative flex flex-col gap-6 shadow-2xl shadow-black/80 animate-[fadeIn_0.3s_ease-out] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveLightboxPolicy(null)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-[#001418]/90 hover:bg-[#00B5AD] hover:text-white border border-[#00B5AD]/30 text-white cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Box */}
            <div className="w-full h-60 sm:h-[350px] rounded-xl overflow-hidden border border-[#00B5AD]/15 bg-[#001418] flex items-center justify-center relative shadow-inner">
              <img
                src={activeLightboxPolicy.image_url}
                alt={activeLightboxPolicy.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Broken Images Gallery */}
            {activeLightboxPolicy.broken_images && activeLightboxPolicy.broken_images.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="block text-[10px] font-black text-[#6B7A82] uppercase tracking-wider">Example Damage Images</span>
                <div className="flex flex-wrap gap-3">
                  {activeLightboxPolicy.broken_images.map((img, idx) => (
                    <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-red-500/30 bg-[#001418] shadow-sm">
                      <img src={img} alt={`Broken example ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#00B5AD]/15 pt-4">
              <div className="space-y-1">
                <span className="block text-[10px] font-black text-[#00B5AD] uppercase tracking-wider">Selected Damage Gear</span>
                <h4 className="text-[#FFFFFF] text-2xl sm:text-3xl font-black font-['Outfit'] uppercase tracking-wide leading-tight">
                  {activeLightboxPolicy.name}
                </h4>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <span className="block text-[10px] font-black text-[#6B7A82] uppercase tracking-wider">Standard Incident Fee</span>
                <span className="text-3xl font-black text-red-500 font-['Outfit'] drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  ${parseFloat(activeLightboxPolicy.price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
