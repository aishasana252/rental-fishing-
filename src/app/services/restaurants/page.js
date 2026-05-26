import React from 'react';
import { query } from '@/lib/db';
import { ChefHat, MapPin, DollarSign, Compass, Award } from 'lucide-react';

async function getRestaurants() {
  try {
    const res = await query('SELECT * FROM restaurants ORDER BY id ASC;');
    if (res.rows.length > 0) {
      return res.rows;
    }
  } catch (error) {
    console.error('Failed to query restaurants, using fallback.', error);
  }

  // Pre-compiled fallback restaurants
  return [
    {
      id: 1,
      name: 'Red Hook Tavern & Grill',
      map_link: 'Red Hook Marina Rd, St. Thomas',
      distance: '0.2 miles from harbor',
      fee_estimate: '$15.00 per fish',
      image_url: '/assets/logo 1.jpeg'
    },
    {
      id: 2,
      name: 'Shoreline Seaside Grille',
      map_link: 'Sapphire Beach, St. Thomas',
      distance: '2.5 miles from harbor',
      fee_estimate: '$18.00 per fish',
      image_url: '/assets/logo 1.jpeg'
    }
  ];
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl mx-auto w-full space-y-16">
      
      {/* 1. HERO HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/25 text-xs font-bold text-[#00B5AD] uppercase tracking-widest animate-pulse">
          <ChefHat className="w-3.5 h-3.5" /> Gourmet Partnerships
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight font-['Outfit',sans-serif]">
          Cook Your Catch Dining
        </h1>
        <p className="text-sm sm:text-base text-[#A0ACB3] leading-relaxed font-semibold">
          Catch it, bring it, eat it! We partner with premier St. Thomas sea-grille chefs who will transform your freshly hooked shoreline catch into a beautifully plated island feast.
        </p>
      </div>

      {/* 2. RESTAURANTS DIRECTORY LISTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {restaurants.map((rest) => (
          <div
            key={rest.id}
            className="flex flex-col rounded-2xl overflow-hidden border border-[#00B5AD]/10 bg-[#04282F]/30 backdrop-blur-sm shadow-xl group hover:border-[#00B5AD]/35 transition-all duration-300"
          >
            {/* Styled Vector Header */}
            <div className="h-16 bg-[#04282F] flex items-center justify-between px-6 border-b border-[#00B5AD]/15">
              <ChefHat className="w-6 h-6 text-[#00B5AD]" />
              <span className="text-[10px] font-black uppercase text-[#6B7A82] tracking-widest">Gourmet Partner</span>
            </div>

            {/* Right details panel */}
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <h3 className="text-xl font-extrabold text-[#FFFFFF] tracking-wide font-['Outfit',sans-serif]">
                  {rest.name}
                </h3>
                
                <div className="space-y-1.5 text-xs font-semibold text-[#A0ACB3]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#3B4E5A] flex-shrink-0" />
                    <span>{rest.map_link}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#3B4E5A] flex-shrink-0" />
                    <span>{rest.distance}</span>
                  </div>
                </div>
              </div>

              {/* Fee and Action Indicator */}
              <div className="border-t border-[#00B5AD]/10 pt-4 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">Chef Preparation Fee</span>
                  <span className="text-[#00B5AD] text-sm font-extrabold flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    {rest.fee_estimate.replace('$', '')}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-[#FFFFFF] bg-[#00B5AD]/10 border border-[#00B5AD]/25 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-[#00B5AD]" />
                  Partner
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. STEP BY STEP EXPLANATION */}
      <section className="rounded-2xl p-8 bg-[#0A424A]/40 border border-[#00B5AD]/15 space-y-6">
        <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider font-['Outfit',sans-serif] text-center">
          How "Cook Your Catch" Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-sm font-semibold text-[#A0ACB3]">
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/30 flex items-center justify-center text-[#00B5AD] font-black text-lg">
              1
            </div>
            <h4 className="text-[#FFFFFF] font-extrabold uppercase mt-2">Hook Your Catch</h4>
            <p className="text-xs text-[#6B7A82] max-w-xs">
              Go out on our rentals or charter and catch legal-sized snapper, yellowtail, or triggerfish.
            </p>
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/30 flex items-center justify-center text-[#00B5AD] font-black text-lg">
              2
            </div>
            <h4 className="text-[#FFFFFF] font-extrabold uppercase mt-2">Choose Chef & Style</h4>
            <p className="text-xs text-[#6B7A82] max-w-xs">
              Contact any of our partner restaurants, tell them you are coming with a catch, and pick your cooking style (Blackened, Fried, Grilled, or Ceviche).
            </p>
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/30 flex items-center justify-center text-[#00B5AD] font-black text-lg">
              3
            </div>
            <h4 className="text-[#FFFFFF] font-extrabold uppercase mt-2">Feast & Celebrate</h4>
            <p className="text-xs text-[#6B7A82] max-w-xs">
              Sit back, enjoy a signature tropical drink, and eat the freshest meal of your entire life with premium sides and plates!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
