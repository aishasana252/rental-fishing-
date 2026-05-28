import React from 'react';
import { query } from '@/lib/db';
import { Anchor, Sparkles } from 'lucide-react';

async function getFishSpecies() {
  try {
    const res = await query('SELECT * FROM fish_species ORDER BY id ASC;');
    if (res.rows.length > 0) {
      return res.rows[0].id ? res.rows : res.rows; // Standard verification
    }
  } catch (error) {
    console.error('Failed to query fish species, using fallback.', error);
  }

  // Pre-compiled fallback fish data
  return [
    {
      id: 1,
      name: 'Snook (Common)',
      description: 'A highly prized, aggressive, and delicious edible game fish found along the sandy shores of St. Thomas. Excellent for shore-to-table cooking, Snooks are strong fighters with a distinct black lateral line running from gills to tail.',
      image_url: '/assets/fish_snook.png'
    },
    {
      id: 2,
      name: 'Tarpon (Silver King)',
      description: 'Known globally as the "Silver King," these massive, prehistoric, acrobatic fish frequent shallow bays and coastal channels. They provide a breathtaking, leap-heavy fight and possess hard bony jaws that make hook-sets challenging.',
      image_url: '/assets/fish_tarpon.png'
    },
    {
      id: 3,
      name: 'Great Barracuda',
      description: 'Fierce ambush predators with razor-sharp teeth. They lurk near rocky shorelines, reef drop-offs, and shallow seagrass flats, providing exciting, fast-paced visual strikes on surface poppers.',
      image_url: '/assets/new_shore_3.png'
    }
  ];
}

export default async function FishSpeciesPage() {
  const species = await getFishSpecies();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl mx-auto w-full space-y-16">
      
      {/* Page Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/25 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
          <Anchor className="w-3.5 h-3.5" /> Caribbean Directory
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight font-['Outfit',sans-serif]">
          Local Shore Fish Species
        </h1>
        <p className="text-sm sm:text-base text-[#A0ACB3] leading-relaxed font-semibold">
          Saint Thomas is home to some of the most thrilling inshore game fish on Earth. Learn how to identify, track, and hook these legendary Caribbean fighters.
        </p>
      </div>

      {/* Fish Species Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {species.map((fish) => (
          <div
            key={fish.id}
            className="flex flex-col rounded-2xl overflow-hidden border border-[#00B5AD]/10 bg-[#04282F]/30 backdrop-blur-sm shadow-xl group hover:border-[#00B5AD]/40 transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Fish Card Image */}
            {fish.image_url && (
              <div className="h-48 w-full overflow-hidden border-b border-[#00B5AD]/15 bg-[#04282F]/40">
                <img
                  src={fish.image_url}
                  alt={fish.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* Card Content Description */}
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00B5AD]" />
                  <h3 className="text-xl font-extrabold text-[#FFFFFF] font-['Outfit',sans-serif] tracking-wide">
                    {fish.name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#A0ACB3] leading-relaxed font-medium">
                  {fish.description}
                </p>
              </div>

              {/* Bottom Decorative Tags */}
              <div className="border-t border-[#00B5AD]/10 pt-4 flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-[#6B7A82] border border-[#6B7A82]/25 px-2.5 py-1 rounded-full uppercase">
                  Shoreline
                </span>
                <span className="text-[10px] font-bold text-[#00B5AD] border border-[#00B5AD]/25 px-2.5 py-1 rounded-full uppercase">
                  Game Fish
                </span>
                {(fish.name.toLowerCase().includes('snook') || fish.name.toLowerCase().includes('yellowtail')) && (
                  <span className="text-[10px] font-bold text-[#FF4D4D] border border-[#FF4D4D]/25 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                    🍽️ Edible Fish
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
