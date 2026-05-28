import { query } from './db.js';
import crypto from 'crypto';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function initDatabase() {
  console.log('Starting database self-healing check...');
  try {
    // 1. Enable UUID extension
    await query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    // 2. Create Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Bookings table
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rental_duration INT CHECK (rental_duration IN (1, 3, 5)),
        pole_quantity INT CHECK (pole_quantity BETWEEN 1 AND 5),
        guide_booked BOOLEAN DEFAULT FALSE,
        guide_hours INT,
        guide_date DATE,
        guide_pickup_location TEXT,
        damage_agreement BOOLEAN DEFAULT FALSE,
        total_price DECIMAL(10, 2) NOT NULL,
        security_added DECIMAL(10, 2) DEFAULT 0.00,
        security_deducted DECIMAL(10, 2) DEFAULT 0.00,
        security_released DECIMAL(10, 2) DEFAULT 0.00,
        rental_date DATE,
        child_pole_quantity INT DEFAULT 0,
        child_pole_date DATE,
        payment_status VARCHAR(50) DEFAULT 'pending',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create Booking Lures table
    await query(`
      CREATE TABLE IF NOT EXISTS booking_lures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        lure_id INT NOT NULL,
        lure_name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL
      );
    `);

    // 5. Create Lures table
    await query(`
      CREATE TABLE IF NOT EXISTS lures (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock_qty INT DEFAULT 20,
        total_qty INT DEFAULT 20,
        damaged_qty INT DEFAULT 0,
        missing_qty INT DEFAULT 0,
        image_url TEXT
      );
    `);

    // 6. Create General Inventory table
    await query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(100) UNIQUE NOT NULL,
        total_qty INT NOT NULL,
        available_qty INT NOT NULL,
        damaged_qty INT DEFAULT 0,
        missing_qty INT DEFAULT 0
      );
    `);

    // 7. Create Damages table
    await query(`
      CREATE TABLE IF NOT EXISTS damages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        damage_type VARCHAR(100) NOT NULL,
        fee_applied DECIMAL(10, 2) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Create Fish Species table
    await query(`
      CREATE TABLE IF NOT EXISTS fish_species (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT
      );
    `);

    // 9. Create Restaurants table
    await query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        map_link TEXT,
        distance VARCHAR(50),
        fee_estimate VARCHAR(50),
        image_url TEXT
      );
    `);

    // 10. Create Contact Messages table
    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. Create Site Content CMS table
    await query(`
      CREATE TABLE IF NOT EXISTS site_content (
        section_key VARCHAR(100) PRIMARY KEY,
        content_data JSONB NOT NULL
      );
    `);

    // 12. Create Damage Policies table
    await query(`
      CREATE TABLE IF NOT EXISTS damage_policies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        broken_images JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 13. Create Guides table
    await query(`
      CREATE TABLE IF NOT EXISTS guides (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        experience VARCHAR(100),
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // --- SEEDING DATA ---

    // Seed Admin User
    const adminCheck = await query("SELECT * FROM users WHERE role = 'admin' LIMIT 1;");
    if (adminCheck.rows.length === 0) {
      const email = 'admin@reelproblems.com';
      const hash = hashPassword('admin123');
      await query(
        `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, 'Administrator', 'admin');`,
        [email, hash]
      );
      console.log('Seeded Admin account: admin@reelproblems.com / admin123');
    }

    // Seed Lures
    const luresCount = await query("SELECT COUNT(*) FROM lures;");
    if (parseInt(luresCount.rows[0].count) === 0) {
      const defaultLures = [
        { name: 'Crystal Minnow', price: 17.50, image: '/assets/logo 1.jpeg' },
        { name: 'Dons Potbelly', price: 4.99, image: '/assets/logo 1.jpeg' },
        { name: 'Storm Shad (3 pack)', price: 9.63, image: '/assets/logo 1.jpeg' },
        { name: 'Lure Pic 4', price: 6.20, image: '/assets/logo 1.jpeg' },
        { name: 'Fins Minnie', price: 12.50, image: '/assets/logo 1.jpeg' },
        { name: 'Popper', price: 13.65, image: '/assets/logo 1.jpeg' }
      ];
      for (const lure of defaultLures) {
        await query(`INSERT INTO lures (name, price, stock_qty, image_url) VALUES ($1, $2, 20, $3);`, [
          lure.name,
          lure.price,
          lure.image
        ]);
      }
      console.log('Seeded default Lures into catalog');
    }

    // Seed Inventory
    const invCount = await query("SELECT COUNT(*) FROM inventory;");
    if (parseInt(invCount.rows[0].count) === 0) {
      const defaultInventory = [
        { item: 'Fishing Poles', total: 20, available: 20 },
        { item: 'Tackleboxes', total: 20, available: 20 },
        { item: 'Pliers', total: 20, available: 20 },
        { item: 'Hooks (pack)', total: 50, available: 50 },
        { item: 'Weights (pack)', total: 50, available: 50 }
      ];
      for (const inv of defaultInventory) {
        await query(
          `INSERT INTO inventory (item_name, total_qty, available_qty) VALUES ($1, $2, $3);`,
          [inv.item, inv.total, inv.available]
        );
      }
      console.log('Seeded default Inventory general stock');
    }

    // Seed Fish Species
    const fishCount = await query("SELECT COUNT(*) FROM fish_species;");
    if (parseInt(fishCount.rows[0].count) === 0) {
      const defaultFish = [
        {
          name: 'Snook',
          desc: 'A highly prized, aggressive game fish found along the sandy shores of St. Thomas. Strong fighters with a distinct black lateral line running from gills to tail.',
          image: '/assets/logo 1.jpeg'
        },
        {
          name: 'Tarpon',
          desc: 'Known globally as the "Silver King," these massive, acrobatic fish frequent shallow bays and coastal channels. They provide a breathtaking, leap-heavy fight.',
          image: '/assets/logo 1.jpeg'
        },
        {
          name: 'Barracuda',
          desc: 'Fierce ambush predators with razor-sharp teeth. They lurk near rocky shorelines and reefs, providing exciting fast-paced strikes and visual attacks.',
          image: '/assets/logo 1.jpeg'
        }
      ];
      for (const fish of defaultFish) {
        await query(
          `INSERT INTO fish_species (name, description, image_url) VALUES ($1, $2, $3);`,
          [fish.name, fish.desc, fish.image]
        );
      }
      console.log('Seeded default Fish Species directory');
    }

    // Seed Restaurants
    const restCount = await query("SELECT COUNT(*) FROM restaurants;");
    if (parseInt(restCount.rows[0].count) === 0) {
      const defaultRestaurants = [
        {
          name: 'Red Hook Tavern & Grill',
          map: 'Red Hook Marina Rd, St. Thomas',
          distance: '0.2 miles from harbor',
          fee: '$15.00 per fish',
          image: '/assets/logo 1.jpeg'
        },
        {
          name: 'Shoreline Seaside Grille',
          map: 'Sapphire Beach, St. Thomas',
          distance: '2.5 miles from harbor',
          fee: '$18.00 per fish',
          image: '/assets/logo 1.jpeg'
        }
      ];
      for (const r of defaultRestaurants) {
        await query(
          `INSERT INTO restaurants (name, map_link, distance, fee_estimate, image_url) VALUES ($1, $2, $3, $4, $5);`,
          [r.name, r.map, r.distance, r.fee, r.image]
        );
      }
      console.log('Seeded "Cook Your Catch" Restaurants');
    }

    // Seed Site Content CMS
    const cmsCount = await query("SELECT COUNT(*) FROM site_content;");
    if (parseInt(cmsCount.rows[0].count) === 0) {
      const homepageContent = {
        hero: [
          {
            title: 'Shore Fishing Rentals in St. Thomas',
            subtitle: 'Experience premier island-style shoreline fishing with high-performance rental gear and expert local guidance.'
          },
          {
            title: 'Professional Shoreline Charters',
            subtitle: 'Get picked up, transported to the hottest secret spots, and guided by a local USVI shoreline expert.'
          },
          {
            title: 'Virtual Saint Thomas Aquarium',
            subtitle: 'Identify and learn about Snook, Tarpon, Barracuda, and other legendary Caribbean fighting species.'
          },
          {
            title: 'Where to Cast in Saint Thomas',
            subtitle: 'Explore our hand-compiled, Google-optimized spot guide complete with coordinates and terrain recommendations.'
          }
        ],
        whyChooseUs: {
          text: 'At Reel Problems Rentals, we believe the ultimate thrill of fishing lies right on the shores of Saint Thomas. We supply professional-grade reels, tackle, and locally handpicked lures, empowering you to navigate the pristine Caribbean coasts with confidence. Whether you are aiming for dynamic strikes from Tarpon or seeking a relaxing day casting by the crystal-clear tides, our seamless rental platform and local, insider knowledge provide everything required for a premium fishing adventure.'
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
      await query(`INSERT INTO site_content (section_key, content_data) VALUES ($1, $2);`, [
        'homepage',
        JSON.stringify(homepageContent)
      ]);

      const locationsContent = {
        spots: [
          {
            name: 'Hull Bay Rock Points',
            terrain: 'Rocky shoreline, shallow flats, coral drop-offs',
            coordinates: '18.3711° N, 64.9542° W',
            description: 'Hull Bay is a local favorite, offering excellent protection from strong currents. The rocky edges on both sides of the sandy beach are premium hideouts for large Snook and active school Tarpon, especially during sunrise and sunset.',
            bestTime: 'Early Morning (5:30 AM - 8:00 AM)',
            lures: 'Crystal Minnow, Popper',
            difficulty: 'Beginner-Intermediate'
          },
          {
            name: 'Sapphire Beach Point',
            terrain: 'Sandy shoals, seagrass flats, current-swept point',
            coordinates: '18.3347° N, 64.8519° W',
            description: 'The shallow sandy point stretching off Sapphire Beach is a highway for fast-moving Jacks, Bonefish, and cruising Barracuda. Wade casting here is highly productive with light tackle or poppers during active high tides.',
            bestTime: 'Incoming High Tide',
            lures: 'Popper, Fins Minnie',
            difficulty: 'Beginner'
          },
          {
            name: 'Coki Point Cliffs',
            terrain: 'Deep volcanic rock shelf, drop-off, clear visibility',
            coordinates: '18.3494° N, 64.8661° W',
            description: 'Just past the beach, the volcanic cliffs of Coki Point drop off rapidly into 15-20 feet of pristine clear water. This sudden depth change attracts aggressive predators like Barracuda, Mutton Snappers, and Houndfish.',
            bestTime: 'Late Afternoon (3:30 PM - 6:00 PM)',
            lures: 'Storm Shad, Crystal Minnow',
            difficulty: 'Advanced (Slippery rocks)'
          },
          {
            name: 'Red Hook Harbor Outlet',
            terrain: 'Deep channels, concrete seawall, tidal current rip',
            coordinates: '18.3242° N, 64.8503° W',
            description: 'The channel current flowing in and out of Red Hook harbor is rich in baitfish. Large Tarpon (the Silver King) wait in the deep shadows of the channel. Cast heavy weights or deep-running lures along the seawalls.',
            bestTime: 'Night & Twilight (7:00 PM - 9:00 PM)',
            lures: 'Storm Shad, Popper',
            difficulty: 'Intermediate'
          }
        ]
      };
      await query(`INSERT INTO site_content (section_key, content_data) VALUES ($1, $2);`, [
        'locations',
        JSON.stringify(locationsContent)
      ]);

      const generalBrokenImagesContent = { images: [] };
      await query(`INSERT INTO site_content (section_key, content_data) VALUES ($1, $2);`, [
        'general_broken_images',
        JSON.stringify(generalBrokenImagesContent)
      ]);

      console.log('Seeded CMS default settings');
    }

    // Seed Damage Policies
    const policiesCount = await query("SELECT COUNT(*) FROM damage_policies;");
    if (parseInt(policiesCount.rows[0].count) === 0) {
      const defaultPolicies = [
        { name: 'Broken Pole', price: 50.00, image: '' },
        { name: 'Strung Reel', price: 50.00, image: '' },
        { name: 'Broken Eye', price: 50.00, image: '' },
        { name: 'Broken Tacklebox shell', price: 25.00, image: '' },
        { name: 'Lost rigging Pliers', price: 10.00, image: '' },
        { name: 'Late Return (Over 1 Hour past window)', price: 100.00, image: '' }
      ];
      for (const p of defaultPolicies) {
        await query(`INSERT INTO damage_policies (name, price, image_url) VALUES ($1, $2, $3);`, [
          p.name,
          p.price,
          p.image
        ]);
      }
      console.log('Seeded default Damage Policies into catalog');
    }

    // Seed Guides
    const guidesCount = await query("SELECT COUNT(*) FROM guides;");
    if (parseInt(guidesCount.rows[0].count) === 0) {
      const defaultGuides = [
        { name: 'Capt. Dan', experience: '15+ Yrs Exp', description: 'Shore Cast Master', image: '/assets/logo 1.jpeg' },
        { name: 'Sarah', experience: '8+ Yrs Exp', description: 'Fly & Wading Pro', image: '/assets/logo 1.jpeg' },
        { name: 'Marcus', experience: '10+ Yrs Exp', description: 'Tarpon Secret Spots', image: '/assets/logo 1.jpeg' }
      ];
      for (const guide of defaultGuides) {
        await query(`INSERT INTO guides (name, experience, description, image_url) VALUES ($1, $2, $3, $4);`, [
          guide.name,
          guide.experience,
          guide.description,
          guide.image
        ]);
      }
      console.log('Seeded default Guides into directory');
    }

    console.log('Database self-healing verification completed successfully.');
  } catch (error) {
    console.error('Critical database initialization error:', error);
  }
}
