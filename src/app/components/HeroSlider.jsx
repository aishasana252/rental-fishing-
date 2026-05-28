'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Anchor } from 'lucide-react';

export default function HeroSlider({ cms }) {
  const [current, setCurrent] = useState(0);

  const baseSlides = [
    {
      image: '/assets/shore_1.png',
      cta: 'Rent Fishing Gear',
      href: '/services/rentals?reset=true',
      isGamingFont: true,
      defaultTitle: 'Shore Fishing Rentals in St. Thomas',
      defaultSubtitle: 'PREMIER ISLAND-STYLE FISHING',
      defaultDescription: 'Experience premier island-style shoreline fishing with high-performance rental gear and expert local guidance.'
    },
    {
      image: '/assets/shore_2.png',
      cta: 'Book a Fishing Guide',
      href: '/services/guide',
      isGamingFont: false,
      defaultTitle: 'Professional Shoreline Charters',
      defaultSubtitle: 'GUIDED BY LOCAL EXPERTS',
      defaultDescription: 'Get picked up, transported to the hottest secret spots, and guided by a local USVI shoreline expert.'
    },
    {
      image: '/assets/shore_3.png',
      cta: 'View Fish Species',
      href: '/services/species',
      isGamingFont: false,
      defaultTitle: 'Virtual Saint Thomas Aquarium',
      defaultSubtitle: 'KNOW YOUR CATCH',
      defaultDescription: 'Identify and learn about Snook, Tarpon, Barracuda, and other legendary Caribbean fighting species.'
    },
    {
      image: '/assets/shore_1.png',
      cta: 'Fishing Locations',
      href: '/services/locations',
      isGamingFont: false,
      defaultTitle: 'Where to Cast in Saint Thomas',
      defaultSubtitle: 'UNLOCK SECRET HOTSPOTS',
      defaultDescription: 'Explore our hand-compiled, Google-optimized spot guide complete with coordinates and terrain recommendations.'
    }
  ];

  // Extract cms text array or use defaults
  const cmsSlides = Array.isArray(cms) ? cms : [cms || {}];

  const slides = baseSlides.map((slide, idx) => ({
    ...slide,
    image: cmsSlides[idx]?.image || slide.image,
    title: cmsSlides[idx]?.title || slide.defaultTitle,
    subtitle: cmsSlides[idx]?.subtitle || slide.defaultSubtitle,
    description: cmsSlides[idx]?.description || slide.defaultDescription
  }));

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] lg:h-auto lg:aspect-video overflow-hidden bg-[#001418] border-b border-[#00B5AD]/20 z-10">
      
      {/* Slides Wrapper */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image - Fresh & Original */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-top"
          />

          {/* Centered Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8 pt-[140px] sm:pt-[160px] lg:pt-[180px] pb-12 sm:pb-16 lg:pb-20 z-20 max-w-5xl mx-auto space-y-3 sm:space-y-4">
            
            {/* Slide Title - Responsive size scaling to prevent line breaks & overlap */}
            <h2 className="text-[#FFFFFF] text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold uppercase tracking-wide leading-tight select-none font-['Outfit',sans-serif] [text-shadow:_0_4px_8px_rgba(0,0,0,0.8),_0_2px_4px_rgba(0,0,0,0.9)] w-full max-w-4xl">
              {slide.title}
            </h2>

            {/* Slide Subtitle - Responsive size scaling */}
            <h3 className="text-[#FFFFFF] text-[11px] sm:text-sm md:text-base lg:text-lg xl:text-xl font-extrabold uppercase tracking-widest pt-1 sm:pt-2 [text-shadow:_0_2px_8px_rgba(0,0,0,0.9),_0_1px_3px_rgba(0,0,0,0.9)]">
              {slide.subtitle}
            </h3>

            {/* Slide Description - Responsive size scaling */}
            <p className="text-[#FFFFFF] text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-medium max-w-2xl leading-relaxed [text-shadow:_0_2px_8px_rgba(0,0,0,0.9),_0_1px_3px_rgba(0,0,0,0.9)] pb-1 sm:pb-2">
              {slide.description}
            </p>

            {/* Slide CTA Button */}
            <div className="pt-2 sm:pt-4">
              <Link
                href={slide.href}
                className="inline-flex items-center justify-center bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] font-extrabold text-[11px] sm:text-xs md:text-sm uppercase tracking-widest px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-xl shadow-[#000000]/40 transition-all hover:scale-105 hover:shadow-[#00B5AD]/40"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Navigation - Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#000000]/40 border border-[#00B5AD]/15 hover:border-[#00B5AD]/55 hover:bg-[#00B5AD]/10 text-[#FFFFFF] hover:text-[#00B5AD] transition-all cursor-pointer hidden sm:block"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Slide Navigation - Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#000000]/40 border border-[#00B5AD]/15 hover:border-[#00B5AD]/55 hover:bg-[#00B5AD]/10 text-[#FFFFFF] hover:text-[#00B5AD] transition-all cursor-pointer hidden sm:block"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === current ? 'bg-[#00B5AD] scale-125 shadow-[0_0_8px_#00B5AD]' : 'bg-[#6B7A82]/50 hover:bg-[#6B7A82]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
