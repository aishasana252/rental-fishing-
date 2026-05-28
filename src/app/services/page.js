import React from 'react';
import Link from 'next/link';
import { Compass, ShoppingBag, ShieldCheck, MapPin, Anchor, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      id: 'rentals',
      title: 'Premium Gear & Rod Rentals',
      description: 'Fully rigged shore fishing packages delivered straight to your hands. Each rental comes equipped with high-performance poles, custom hooks/weights, pliers, and an elite tacklebox.',
      badge: 'Bestseller',
      priceText: 'From $25 / Day',
      icon: <ShoppingBag className="w-6 h-6 text-[#00B5AD]" />,
      image: '/assets/service_rentals.png',
      href: '/services/rentals',
      features: ['Tacklebox Included', '6 Special Lure Add-ons', 'Comprehensive Damage Protection', 'Red Hook Pick-up/Return']
    },
    {
      id: 'guide',
      title: 'Guided Shoreline Charters',
      description: 'Maximize your catches with our elite guided experiences. Get picked up directly from your resort, transported to top hidden shoreline spots, and coached by a local USVI shoreline champion.',
      badge: '$65 / Hour',
      priceText: 'Gear & Transport Included',
      icon: <Compass className="w-6 h-6 text-[#00B5AD]" />,
      image: '/assets/service_guide.png',
      href: '/services/guide',
      features: ['Roundtrip pickup/dropoff', 'No experience required', 'Keep what you catch', '100% Gear provided']
    },
    {
      id: 'locations',
      title: 'Where To Fish Spot Directory',
      description: 'Explore the definitive educational guide to St. Thomas shoreline fishing hotspots. Fully mapped directions, terrain breakdowns, tides info, and insider casting suggestions.',
      badge: 'Free Guide',
      priceText: 'Beginner Friendly',
      icon: <MapPin className="w-6 h-6 text-[#00B5AD]" />,
      image: '/assets/service_locations.png',
      href: '/services/locations',
      features: ['St. Thomas Spots Map', 'Detailed Species Catalog', 'Angling Pro-tips', 'Target Coordinates']
    },
    {
      id: 'restaurants',
      title: 'Cook Your Catch Dining',
      description: 'Turn your legendary catch into a five-star culinary dining experience! We partner with elite local St. Thomas restaurants that will beautifully clean, cook, and plate your fresh fish.',
      badge: 'Local Special',
      priceText: 'From $15 / Person',
      icon: <Anchor className="w-6 h-6 text-[#00B5AD]" />,
      image: '/assets/service_restaurants.png',
      href: '/services/restaurants',
      features: ['Partnered Locations Map', 'Preparation Customization', 'Competitive Fee Estimates', 'Freshness Guaranteed']
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto w-full space-y-16">
      
      {/* Dynamic Wave-Inspired Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
          Reel Services
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight font-['Outfit',sans-serif]">
          Premium Angling Experiences
        </h1>
        <p className="text-sm sm:text-base text-[#A0ACB3] leading-relaxed font-semibold">
          Unlock the ultimate thrill of Caribbean shoreline fishing. From robust rod rentals to guided shore excursions and gourmet fish dinners, we have your St. Thomas adventure covered.
        </p>
      </div>

      {/* Services Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="flex flex-col rounded-2xl overflow-hidden border border-[#00B5AD]/10 bg-[#04282F]/30 backdrop-blur-sm shadow-xl shadow-[#000000]/40 group hover:border-[#00B5AD]/40 transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Service Top Banner Image */}
            <div className="h-56 relative overflow-hidden">
              <img
                src={svc.image}
                alt={svc.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 z-20 bg-[#00B5AD] text-[#FFFFFF] text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                {svc.badge}
              </div>
            </div>

            {/* Service Content Details */}
            <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#04282F] border border-[#00B5AD]/25">
                    {svc.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-wide text-[#FFFFFF] font-['Outfit',sans-serif]">
                    {svc.title}
                  </h3>
                </div>

                <p className="text-sm text-[#A0ACB3] leading-relaxed font-medium">
                  {svc.description}
                </p>

                {/* Features List */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-[#6B7A82] pt-2">
                  {svc.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00B5AD] flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action and Price Button Row */}
              <div className="border-t border-[#00B5AD]/10 pt-6 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-[11px] font-bold text-[#6B7A82] uppercase tracking-wider">Pricing</span>
                  <span className="text-[#00B5AD] text-[15px] font-extrabold">{svc.priceText}</span>
                </div>

                <Link
                  href={svc.href}
                  className="flex items-center gap-1 bg-[#00B5AD]/10 hover:bg-[#00B5AD] border border-[#00B5AD]/45 hover:border-transparent text-[#00B5AD] hover:text-[#FFFFFF] text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-full transition-all"
                >
                  Configure
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
