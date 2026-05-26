import React from 'react';
import { query } from '@/lib/db';
import { MapPin, Compass, AlertCircle, Sparkles, Anchor, Waves } from 'lucide-react';

async function getSpots() {
  try {
    const res = await query('SELECT * FROM site_content WHERE section_key = \'locations\' LIMIT 1;');
    if (res.rows.length > 0 && res.rows[0].content_data && Array.isArray(res.rows[0].content_data.spots)) {
      return res.rows[0].content_data.spots;
    }
  } catch (e) {
    console.error('Error loading spots CMS, using fallback.', e);
  }

  // Pre-compiled high-SEO value default locations
  return [
    {
      name: 'Hull Bay Rock Points',
      terrain: 'Rocky shoreline, shallow flats, coral drop-offs',
      coordinates: '18.3711° N, 64.9542° W',
      description: 'Hull Bay is a local favorite, offering excellent protection from strong currents. The rocky edges on both sides of the sandy beach are premium hideouts for large Snook and active school Tarpon, especially during sunrise and sunset.',
      bestTime: 'Early Morning (5:30 AM - 8:00 AM)',
      lures: 'Crystal Minnow, Popper',
      difficulty: 'Beginner-Intermediate',
      image: '/assets/spot_hull_bay.png'
    },
    {
      name: 'Sapphire Beach Point',
      terrain: 'Sandy shoals, seagrass flats, current-swept point',
      coordinates: '18.3347° N, 64.8519° W',
      description: 'The shallow sandy point stretching off Sapphire Beach is a highway for fast-moving Jacks, Bonefish, and cruising Barracuda. Wade casting here is highly productive with light tackle or poppers during active high tides.',
      bestTime: 'Incoming High Tide',
      lures: 'Popper, Fins Minnie',
      difficulty: 'Beginner',
      image: '/assets/spot_sapphire.png'
    },
    {
      name: 'Coki Point Cliffs',
      terrain: 'Deep volcanic rock shelf, drop-off, clear visibility',
      coordinates: '18.3494° N, 64.8661° W',
      description: 'Just past the beach, the volcanic cliffs of Coki Point drop off rapidly into 15-20 feet of pristine clear water. This sudden depth change attracts aggressive predators like Barracuda, Mutton Snappers, and Houndfish.',
      bestTime: 'Late Afternoon (3:30 PM - 6:00 PM)',
      lures: 'Storm Shad, Crystal Minnow',
      difficulty: 'Advanced (Slippery rocks)',
      image: '/assets/spot_coki.png'
    },
    {
      name: 'Red Hook Harbor Outlet',
      terrain: 'Deep channels, concrete seawall, tidal current rip',
      coordinates: '18.3242° N, 64.8503° W',
      description: 'The channel current flowing in and out of Red Hook harbor is rich in baitfish. Large Tarpon (the Silver King) wait in the deep shadows of the channel. Cast heavy weights or deep-running lures along the seawalls.',
      bestTime: 'Night & Twilight (7:00 PM - 9:00 PM)',
      lures: 'Storm Shad, Popper',
      difficulty: 'Intermediate',
      image: '/assets/spot_red_hook.png'
    }
  ];
}

export default async function LocationsPage() {
  let spots = await getSpots();
  if (!spots || !Array.isArray(spots)) {
    spots = [];
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl mx-auto w-full space-y-16">
      
      {/* 1. HERO HEADER */}
      <div className="relative rounded-3xl overflow-hidden border border-[#00B5AD]/25 bg-[#04282F]/30 backdrop-blur-sm shadow-xl p-8 sm:p-12 text-center space-y-4">
        <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-[#00B5AD]/5 rounded-full pointer-events-none blur-3xl" />
        <div className="inline-flex items-center gap-1 text-[#00B5AD] text-xs font-extrabold uppercase tracking-widest bg-[#00B5AD]/10 border border-[#00B5AD]/25 px-4 py-1.5 rounded-full">
          <Anchor className="w-3.5 h-3.5" /> St. Thomas Angling Maps
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight uppercase font-['Outfit',sans-serif] bg-gradient-to-r from-[#FFFFFF] via-[#00B5AD] to-[#FFFFFF] bg-clip-text text-transparent">
          Best Shore Fishing Spots in St. Thomas
        </h1>
        <p className="text-sm sm:text-base text-[#A0ACB3] max-w-3xl mx-auto leading-relaxed font-semibold">
          Discover beginner-friendly casting flats, deep volcanic drop-offs, and secret local shoreline destinations. Follow our guide to fish safely, ethically, and productively across Saint Thomas.
        </p>
      </div>

      {/* 2. LOCATIONS CARDS */}
      <div className="space-y-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-l-4 border-[#00B5AD] pl-3">
          Top Shoreline Casting Hotspots
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {spots.map((spot, idx) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden bg-[#04282F]/20 border border-[#00B5AD]/10 hover:border-[#00B5AD]/35 transition-all duration-300 shadow-lg shadow-[#000000]/20 flex flex-col justify-between"
            >
              {/* Spot Card Image Banner - Custom for each spot */}
              {spot.image && (
                <div className="h-48 w-full overflow-hidden border-b border-[#00B5AD]/15">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}
              
              <div className="p-6 sm:p-8 space-y-6 flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#FFFFFF] font-['Outfit',sans-serif] tracking-wide">
                      {spot.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[#00B5AD] text-[10px] font-bold uppercase border border-[#00B5AD]/20 bg-[#00B5AD]/5 px-2.5 py-1 rounded-full">
                      <Compass className="w-3 h-3" />
                      {spot.difficulty}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7A82]">
                    <MapPin className="w-4 h-4 text-[#3B4E5A] flex-shrink-0" />
                    <span className="font-mono tracking-wider">{spot.coordinates}</span>
                  </div>

                  <p className="text-sm text-[#A0ACB3] leading-relaxed font-medium">
                    {spot.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-bold border-t border-[#00B5AD]/10">
                    <div>
                      <span className="block text-[#6B7A82] uppercase text-[10px] tracking-wider mb-1">Terrain</span>
                      <span className="text-[#FFFFFF]">{spot.terrain}</span>
                    </div>
                    <div>
                      <span className="block text-[#6B7A82] uppercase text-[10px] tracking-wider mb-1">Best Window</span>
                      <span className="text-[#00B5AD]">{spot.bestTime}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#00B5AD]/5 flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-[#6B7A82]">
                    <Sparkles className="w-4 h-4 text-[#00B5AD]" />
                    <span>Recommended Lures: <span className="text-[#FFFFFF]">{spot.lures}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SAFETY AND GEAR BASICS */}
      <section className="rounded-2xl p-8 bg-[#0A424A]/40 border border-[#00B5AD]/15 space-y-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#00B5AD] animate-bounce" />
          <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider font-['Outfit',sans-serif]">
            Angling Safety & Etiquette in USVI
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-semibold text-[#A0ACB3] leading-relaxed">
          <div className="space-y-2">
            <h4 className="text-[#FFFFFF] font-extrabold text-sm uppercase">1. Watch the Surge</h4>
            <p className="text-xs font-semibold text-[#6B7A82]">
              Volcanic rock cliff spots (like Coki Point) can experience sudden, large swells. Never turn your back on the ocean and wear shoes with solid traction.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[#FFFFFF] font-extrabold text-sm uppercase">2. Respect the Coral</h4>
            <p className="text-xs font-semibold text-[#6B7A82]">
              Do not drop anchors, sinkers, or lines directly onto living coral reefs. Use our 30 lb test fishing lines to reduce snag loss and keep reefs pristine.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[#FFFFFF] font-extrabold text-sm uppercase">3. Catch & Release Rules</h4>
            <p className="text-xs font-semibold text-[#6B7A82]">
              While you are free to keep fish for partnered restaurant cooking, we encourage releasing spawning species like large Snooks to protect the ecosystem.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
