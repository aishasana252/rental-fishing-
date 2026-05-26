import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Anchor, ShieldAlert, Award, Compass, ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import HeroSlider from './components/HeroSlider';

// This is a Server Component that queries site CMS content from database
async function getCMSContent() {
  const fallback = {
    hero: [
      {
        title: 'Shore Fishing Rentals in St. Thomas',
        subtitle: 'PREMIER ISLAND-STYLE FISHING',
        description: 'Experience premier island-style shoreline fishing with high-performance rental gear and expert local guidance.'
      },
      {
        title: 'Professional Shoreline Charters',
        subtitle: 'GUIDED BY LOCAL EXPERTS',
        description: 'Get picked up, transported to the hottest secret spots, and guided by a local USVI shoreline expert.'
      },
      {
        title: 'Virtual Saint Thomas Aquarium',
        subtitle: 'KNOW YOUR CATCH',
        description: 'Identify and learn about Snook, Tarpon, Barracuda, and other legendary Caribbean fighting species.'
      },
      {
        title: 'Where to Cast in Saint Thomas',
        subtitle: 'UNLOCK SECRET HOTSPOTS',
        description: 'Explore our hand-compiled, Google-optimized spot guide complete with coordinates and terrain recommendations.'
      }
    ],
    whyChooseUs: {
      text: 'At Reel Fishing Company, we believe the ultimate thrill of fishing lies right on the shores of Saint Thomas. We supply professional-grade reels, tackle, and locally handpicked lures, empowering you to navigate the pristine Caribbean coasts with confidence. Whether you are aiming for dynamic strikes from Tarpon or seeking a relaxing day casting by the crystal-clear tides, our seamless rental platform and local, insider knowledge provide everything required for a premium fishing adventure.'
    },
    guides: {
      title: "Fish with St. Thomas's Champion Guides",
      text: "Embark on the ultimate Caribbean fishing adventure. Led by St. Thomas's champion shoreline guides, you will bypass the crowded tourist traps and cast directly into thriving, secret waters where monster Tarpon, Snook, and Jack Crevalle hunt. Whether you're a seasoned angler or casting a line for the first time, our elite guides provide customized, one-on-one coaching, premium rod setups, and roundtrip resort transport to ensure a legendary shoreline catch.",
      image: "/assets/service_guide.png"
    },
    spots: {
      title: "Unlock Secret Shoreline Fishing Hotspots",
      text: "Gain exclusive access to the island's most coveted shoreline angling destinations. From the crystal-clear tides of Hull Bay to the rocky ledges of Red Hook, our definitive, fully mapped spot directory offers complete GPS coordinates, terrain insights, tide analytics, and local species catalogs. Master the pristine shoreline with real-time insider intelligence and fish like a seasoned St. Thomas native.",
      image: "/assets/service_locations.png"
    },
    dining: {
      title: "Savor Your Fresh Catch: Shore-to-Table Dining",
      text: "Celebrate your legendary day on the Caribbean shore with an unforgettable gourmet reward. We have partnered with St. Thomas's finest oceanside restaurants to clean, prepare, and beautifully plate your fresh catch. Indulge in yellowtail snapper or barracuda grilled to absolute perfection, accompanied by tropical mango salsas and cold local beverages, while dining right on the water's edge.",
      image: "/assets/new_shore_4.png"
    }
  };

  try {
    const res = await query("SELECT * FROM site_content WHERE section_key = 'homepage' LIMIT 1;");
    if (res.rows.length > 0) {
      return {
        ...fallback,
        ...res.rows[0].content_data
      };
    }
  } catch (error) {
    console.error('Failed to load CMS content, using static fallback.', error);
  }
  return fallback;
}

export default async function HomePage() {
  const content = await getCMSContent();

  const galleryImages = [
    { src: '/assets/new_shore_1.png', label: 'Angling Gear' },
    { src: '/assets/new_shore_2.png', label: 'Secluded Bay' },
    { src: '/assets/new_shore_3.png', label: 'Active Casting' },
    { src: '/assets/new_shore_4.png', label: 'Colorful Lures' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SLIDER SECTION */}
      <HeroSlider cms={content.hero} />

      {/* 2. WHY CHOOSE US SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Classical Persuasive Text - Left 7 Columns */}
          <div className="lg:col-span-7 space-y-6">
            
            <h2 className="text-[#FFFFFF] text-4xl sm:text-5xl font-extrabold tracking-tight font-['Cinzel',serif] border-l-4 border-[#00B5AD] pl-4 leading-tight">
              Why Choose Us?
            </h2>

            <p className="text-lg sm:text-xl text-[#E2E8F0] font-['Inter',sans-serif] leading-relaxed pr-4 text-justify font-normal">
              {content.whyChooseUs.text}
            </p>
          </div>

          {/* Gallery Grid - Right 5 Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-[#00B5AD]/15 shadow-xl shadow-[#000000]/30 aspect-square"
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="object-cover w-full h-full"
                />
                {/* Overlay Text */}
                <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <span className="text-[#00B5AD] text-xs font-bold uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {img.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 3. EXPLORE SERVICES SECTION */}
      <section className="py-20 relative z-10 w-full bg-[#0A424A]/40 border-y border-[#00B5AD]/15 overflow-hidden">
        
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-wide font-['Outfit',sans-serif]">
            Ready to Catch the Silver King?
          </h3>
          
          <p className="text-[#A0ACB3] max-w-2xl mx-auto text-[15px] sm:text-lg leading-relaxed font-semibold">
            Unlock the ultimate shoreline experience. Reserve your high-end rods, tackleboxes, and customized island lures today. Or coordinate a personalized guided shoreline charter.
          </p>

          <div className="pt-4 flex justify-center items-center">
            <Link
              href="/services"
              className="flex items-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] font-extrabold text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-lg shadow-[#00B5AD]/25 transform transition-all duration-300 hover:scale-105"
            >
              Explore Services
              <ArrowRight className="w-4 h-4 animate-[bounce_1.5s_infinite_horizontal]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. GUIDED SHORELINE CHARTERS SECTION (Image Right, Text Left) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 w-full bg-gradient-to-br from-[#0A424A]/25 to-[#002830]/40 border-b border-[#00B5AD]/15 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Content Column */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#04282F] border border-[#00B5AD]/25 text-[#00B5AD] shadow-lg shadow-[#000000]/20">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-wide font-['Outfit',sans-serif]">
                  {content.guides.title}
                </h3>
              </div>

              <p className="text-base sm:text-lg text-[#A0ACB3] font-['Inter',sans-serif] leading-relaxed pr-4 text-justify font-normal">
                {content.guides.text}
              </p>

              <div className="pt-4 flex">
                <Link
                  href="/services/guide"
                  className="flex items-center justify-center gap-2 bg-[#00B5AD]/10 hover:bg-[#00B5AD] border border-[#00B5AD]/45 hover:border-transparent text-[#00B5AD] hover:text-[#FFFFFF] text-xs font-extrabold uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-[#00B5AD]/25"
                >
                  Book a Guided Shore Excursion
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Image Column */}
            <div className="lg:col-span-5 relative group rounded-2xl overflow-hidden border border-[#00B5AD]/15 shadow-2xl shadow-[#000000]/40 aspect-[4/3] order-1 lg:order-2">
              <img
                src={content.guides.image}
                alt="Guided Shoreline Charters in St. Thomas"
                className="object-cover w-full h-full rounded-2xl"
              />
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-[#00B5AD] text-[#FFFFFF] text-xs font-extrabold px-4 py-2 rounded-full shadow-lg z-20">
                $100 / Hour
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. WHERE TO FISH SPOT DIRECTORY SECTION (Image Right, Text Left) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 w-full bg-[#002830]/30 border-b border-[#00B5AD]/15 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Content Column */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#04282F] border border-[#00B5AD]/25 text-[#00B5AD] shadow-lg shadow-[#000000]/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-wide font-['Outfit',sans-serif]">
                  {content.spots.title}
                </h3>
              </div>

              <p className="text-base sm:text-lg text-[#A0ACB3] font-['Inter',sans-serif] leading-relaxed pr-4 text-justify font-normal">
                {content.spots.text}
              </p>

              <div className="pt-4 flex">
                <Link
                  href="/services/locations"
                  className="flex items-center justify-center gap-2 bg-[#00B5AD]/10 hover:bg-[#00B5AD] border border-[#00B5AD]/45 hover:border-transparent text-[#00B5AD] hover:text-[#FFFFFF] text-xs font-extrabold uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-[#00B5AD]/25"
                >
                  Discover Secret Fishing Spots
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Image Column */}
            <div className="lg:col-span-5 relative group rounded-2xl overflow-hidden border border-[#00B5AD]/15 shadow-2xl shadow-[#000000]/40 aspect-[4/3] order-1 lg:order-2">
              <img
                src={content.spots.image}
                alt="St. Thomas secret fishing spots directory map"
                className="object-cover w-full h-full rounded-2xl"
              />
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-[#00B5AD] text-[#FFFFFF] text-xs font-extrabold px-4 py-2 rounded-full shadow-lg z-20">
                Free Guide
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. COOK YOUR CATCH DINING SECTION (Image Right, Text Left) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 w-full bg-gradient-to-tr from-[#002830]/40 to-[#0A424A]/25 border-b border-[#00B5AD]/15 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Content Column */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#04282F] border border-[#00B5AD]/25 text-[#00B5AD] shadow-lg shadow-[#000000]/20">
                  <Anchor className="w-6 h-6" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-wide font-['Outfit',sans-serif]">
                  {content.dining.title}
                </h3>
              </div>

              <p className="text-base sm:text-lg text-[#A0ACB3] font-['Inter',sans-serif] leading-relaxed pr-4 text-justify font-normal">
                {content.dining.text}
              </p>

              <div className="pt-4 flex">
                <Link
                  href="/services/restaurants"
                  className="flex items-center justify-center gap-2 bg-[#00B5AD]/10 hover:bg-[#00B5AD] border border-[#00B5AD]/45 hover:border-transparent text-[#00B5AD] hover:text-[#FFFFFF] text-xs font-extrabold uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-[#00B5AD]/25"
                >
                  Browse Shore-to-Table Dining
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Image Column */}
            <div className="lg:col-span-5 relative group rounded-2xl overflow-hidden border border-[#00B5AD]/15 shadow-2xl shadow-[#000000]/40 aspect-[4/3] order-1 lg:order-2">
              <img
                src={content.dining.image}
                alt="Cook your catch at St. Thomas restaurants"
                className="object-cover w-full h-full rounded-2xl"
              />
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-[#00B5AD] text-[#FFFFFF] text-xs font-extrabold px-4 py-2 rounded-full shadow-lg z-20">
                Local Special
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
