const { query } = require('./src/lib/db');

async function fixDB() {
  const newContent = {
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
    await query(`UPDATE site_content SET content_data = $1 WHERE section_key = 'homepage'`, [newContent]);
    console.log('Successfully updated DB with split subtitle and description!');
  } catch (e) {
    console.error(e);
  }
}

fixDB();
