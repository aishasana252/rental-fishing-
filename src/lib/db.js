import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Setup file paths for JSON mock database
const MOCK_DB_PATH = path.join(process.cwd(), 'db_mock.json');

// Helper to hash password for mock users
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Default initial mock database state
const INITIAL_MOCK_DATA = {
  users: [
    {
      id: 'd9e03d4a-5b12-4f7f-a64d-ec12a14e9f5e',
      email: 'admin@reelproblems.com',
      password_hash: hashPassword('admin123'),
      full_name: 'Administrator',
      phone: '770-910-0503',
      role: 'admin',
      created_at: new Date().toISOString()
    }
  ],
  bookings: [],
  booking_lures: [],
  lures: [
    { id: 1, name: 'Crystal Minnow', price: 17.50, stock_qty: 20, image_url: '/assets/logo 1.jpeg' },
    { id: 2, name: 'Dons Potbelly', price: 4.99, stock_qty: 20, image_url: '/assets/logo 1.jpeg' },
    { id: 3, name: 'Storm Shad (3 pack)', price: 9.63, stock_qty: 20, image_url: '/assets/logo 1.jpeg' },
    { id: 4, name: 'Lure Pic 4', price: 6.20, stock_qty: 20, image_url: '/assets/logo 1.jpeg' },
    { id: 5, name: 'Fins Minnie', price: 12.50, stock_qty: 20, image_url: '/assets/logo 1.jpeg' },
    { id: 6, name: 'Popper', price: 13.65, stock_qty: 20, image_url: '/assets/logo 1.jpeg' }
  ],
  inventory: [
    { id: 1, item_name: 'Fishing Poles', total_qty: 20, available_qty: 20, damaged_qty: 0, missing_qty: 0 },
    { id: 2, item_name: 'Tackleboxes', total_qty: 20, available_qty: 20, damaged_qty: 0, missing_qty: 0 },
    { id: 3, item_name: 'Pliers', total_qty: 20, available_qty: 20, damaged_qty: 0, missing_qty: 0 },
    { id: 4, item_name: 'Hooks (pack)', total_qty: 50, available_qty: 50, damaged_qty: 0, missing_qty: 0 },
    { id: 5, item_name: 'Weights (pack)', total_qty: 50, available_qty: 50, damaged_qty: 0, missing_qty: 0 }
  ],
  damages: [],
  fish_species: [
    {
      id: 1,
      name: 'Snook',
      description: 'A highly prized, aggressive game fish found along the sandy shores of St. Thomas. Strong fighters with a distinct black lateral line running from gills to tail.',
      image_url: '/assets/logo 1.jpeg'
    },
    {
      id: 2,
      name: 'Tarpon',
      description: 'Known globally as the "Silver King," these massive, acrobatic fish frequent shallow bays and coastal channels. They provide a breathtaking, leap-heavy fight.',
      image_url: '/assets/logo 1.jpeg'
    },
    {
      id: 3,
      name: 'Barracuda',
      description: 'Fierce ambush predators with razor-sharp teeth. They lurk near rocky shorelines and reefs, providing exciting fast-paced strikes and visual attacks.',
      image_url: '/assets/logo 1.jpeg'
    }
  ],
  restaurants: [
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
  ],
  site_content: [
    {
      section_key: 'homepage',
      content_data: {
        hero: {
          title: 'Shore Fishing Rentals in St. Thomas',
          subtitle: 'Experience premier island-style shoreline fishing with high-performance rental gear and expert local guidance.'
        },
        whyChooseUs: {
          text: 'At Reel Problems Rentals, we believe the ultimate thrill of fishing lies right on the shores of Saint Thomas. We supply professional-grade reels, tackle, and locally handpicked lures, empowering you to navigate the pristine Caribbean coasts with confidence. Whether you are aiming for dynamic strikes from Tarpon or seeking a relaxing day casting by the crystal-clear tides, our seamless rental platform and local, insider knowledge provide everything required for a premium fishing adventure.'
        }
      }
    },
    {
      section_key: 'general_broken_images',
      content_data: {
        images: []
      }
    },
    {
      section_key: 'locations',
      content_data: {
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
      }
    }
  ],
  contact_messages: [],
  damage_policies: [
    { id: 1, name: 'Broken Pole', price: 50.00, image_url: '', broken_images: [] },
    { id: 2, name: 'Strung Reel', price: 50.00, image_url: '', broken_images: [] },
    { id: 3, name: 'Broken Eye', price: 50.00, image_url: '', broken_images: [] },
    { id: 4, name: 'Broken Tacklebox shell', price: 25.00, image_url: '', broken_images: [] },
    { id: 5, name: 'Lost rigging Pliers', price: 10.00, image_url: '', broken_images: [] },
    { id: 6, name: 'Late Return (Over 1 Hour past window)', price: 100.00, image_url: '', broken_images: [] }
  ],
  guides: [
    { id: 1, name: 'Capt. Dan', experience: '15+ Yrs Exp', description: 'Shore Cast Master', image_url: '/assets/logo 1.jpeg' },
    { id: 2, name: 'Sarah', experience: '8+ Yrs Exp', description: 'Fly & Wading Pro', image_url: '/assets/logo 1.jpeg' },
    { id: 3, name: 'Marcus', experience: '10+ Yrs Exp', description: 'Tarpon Secret Spots', image_url: '/assets/logo 1.jpeg' }
  ]
};

// Initialize Mock JSON File if not exists
function getMockDB() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(INITIAL_MOCK_DATA, null, 2), 'utf-8');
    return INITIAL_MOCK_DATA;
  }
  try {
    const data = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    let dirty = false;
    if (!db.guides) {
      db.guides = INITIAL_MOCK_DATA.guides;
      dirty = true;
    }
    if (!db.damage_policies) {
      db.damage_policies = INITIAL_MOCK_DATA.damage_policies;
      dirty = true;
    }
    if (!db.fish_species) {
      db.fish_species = INITIAL_MOCK_DATA.fish_species;
      dirty = true;
    }
    if (dirty) {
      saveMockDB(db);
    }
    return db;
  } catch (e) {
    console.error('Error reading mock DB file, resetting to defaults.', e);
    return INITIAL_MOCK_DATA;
  }
}

function saveMockDB(data) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// State variable to track fallback mode
let isFallbackMode = false;
let pool = null;

// Initialize connection pool
function getPool() {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) {
    isFallbackMode = true;
    console.warn('DATABASE_URL env variable not found. Activating offline JSON Mock Database.');
    return null;
  }
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000 // 5 seconds timeout to failover quickly
    });
    return pool;
  } catch (error) {
    isFallbackMode = true;
    console.error('Failed to create database connection pool. Switching to JSON Mock DB.', error);
    return null;
  }
}

// MOCK QUERY TRANSLATION LAYER
function handleMockQuery(text, params = []) {
  const db = getMockDB();
  const sql = text.trim().replace(/\s+/g, ' ');

  // 1. SELECT * FROM users WHERE email = $1 LIMIT 1
  if (sql.includes('SELECT * FROM users WHERE email = $1')) {
    const email = params[0].toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 2. INSERT INTO users (email, password_hash, full_name, phone, role)
  if (sql.includes('INSERT INTO users') && sql.includes('role')) {
    const [email, password_hash, full_name, phone, role] = params;
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password_hash,
      full_name,
      phone,
      role: role || 'customer',
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    saveMockDB(db);
    return { rows: [newUser], rowCount: 1 };
  }

  // 3. SELECT * FROM bookings
  if (sql.includes('SELECT * FROM bookings') && !sql.includes('user_id')) {
    // Return all bookings with joined user details
    const joined = db.bookings.map((b) => {
      const u = db.users.find((user) => user.id === b.user_id) || {};
      return {
        ...b,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone
      };
    });
    // Sort by created_at desc
    joined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: joined, rowCount: joined.length };
  }

  // 4. SELECT * FROM bookings WHERE user_id = $1
  if (sql.includes('SELECT * FROM bookings WHERE user_id = $1')) {
    const userId = params[0];
    const userBookings = db.bookings.filter((b) => b.user_id === userId);
    userBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: userBookings, rowCount: userBookings.length };
  }

  // 5. INSERT INTO bookings
  if (sql.includes('INSERT INTO bookings')) {
    const [
      user_id,
      rental_duration,
      pole_quantity,
      guide_booked,
      guide_hours,
      guide_date,
      guide_pickup_location,
      damage_agreement,
      total_price,
      security_added,
      payment_status,
      status,
      rental_date,
      child_pole_quantity,
      child_pole_date,
      paypal_order_id,
      payment_method
    ] = params;

    const newBooking = {
      id: crypto.randomUUID(),
      user_id,
      rental_duration: rental_duration ? parseInt(rental_duration) : null,
      pole_quantity: pole_quantity ? parseInt(pole_quantity) : null,
      guide_booked: !!guide_booked,
      guide_hours: guide_hours ? parseInt(guide_hours) : null,
      guide_date: guide_date || null,
      guide_pickup_location: guide_pickup_location || null,
      damage_agreement: !!damage_agreement,
      total_price: parseFloat(total_price),
      security_added: security_added ? parseFloat(security_added) : 0.00,
      security_deducted: 0.00,
      security_released: 0.00,
      rental_date: rental_date || null,
      child_pole_quantity: child_pole_quantity ? parseInt(child_pole_quantity) : 0,
      child_pole_date: child_pole_date || null,
      paypal_order_id: paypal_order_id || null,
      payment_method: payment_method || 'card',
      payment_status: payment_status || 'pending',
      status: status || 'pending',
      created_at: new Date().toISOString()
    };

    db.bookings.push(newBooking);

    // Auto-update general inventory when booking is created!
    const poles = db.inventory.find(i => i.item_name === 'Fishing Poles');
    const boxes = db.inventory.find(i => i.item_name === 'Tackleboxes');
    if (poles) poles.available_qty = Math.max(0, poles.available_qty - newBooking.pole_quantity);
    if (boxes) boxes.available_qty = Math.max(0, boxes.available_qty - newBooking.pole_quantity);

    saveMockDB(db);
    return { rows: [newBooking], rowCount: 1 };
  }

  // 6. SELECT * FROM booking_lures WHERE booking_id = $1
  if (sql.includes('SELECT * FROM booking_lures WHERE booking_id = $1')) {
    const bookingId = params[0];
    const lures = db.booking_lures.filter((bl) => bl.booking_id === bookingId);
    return { rows: lures, rowCount: lures.length };
  }

  // 7. INSERT INTO booking_lures
  if (sql.includes('INSERT INTO booking_lures')) {
    const [booking_id, lure_id, lure_name, price, quantity] = params;
    const newBL = {
      id: crypto.randomUUID(),
      booking_id,
      lure_id: parseInt(lure_id),
      lure_name,
      price: parseFloat(price),
      quantity: parseInt(quantity)
    };
    db.booking_lures.push(newBL);

    // Decrement lure stock
    const lure = db.lures.find(l => l.id === parseInt(lure_id));
    if (lure) {
      lure.stock_qty = Math.max(0, lure.stock_qty - parseInt(quantity));
    }

    saveMockDB(db);
    return { rows: [newBL], rowCount: 1 };
  }

  // 8. SELECT * FROM inventory
  if (sql.includes('SELECT * FROM inventory')) {
    return { rows: db.inventory, rowCount: db.inventory.length };
  }

  // 9. UPDATE inventory SET available_qty = $1, total_qty = $2, damaged_qty = $3, missing_qty = $4 WHERE item_name = $5
  if (sql.includes('UPDATE inventory SET available_qty = $1')) {
    const [available_qty, total_qty, damaged_qty, missing_qty, item_name] = params;
    const item = db.inventory.find(i => i.item_name === item_name);
    if (item) {
      item.available_qty = parseInt(available_qty);
      item.total_qty = parseInt(total_qty);
      item.damaged_qty = parseInt(damaged_qty);
      item.missing_qty = parseInt(missing_qty);
      saveMockDB(db);
    }
    return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
  }

  // 10. SELECT * FROM lures
  if (sql.includes('SELECT * FROM lures')) {
    return { rows: db.lures, rowCount: db.lures.length };
  }

  // INSERT INTO lures
  if (sql.includes('INSERT INTO lures')) {
    const [name, price, image_url, stock_qty] = params;
    const newLure = {
      id: db.lures.length > 0 ? Math.max(...db.lures.map(l => l.id)) + 1 : 1,
      name,
      price: parseFloat(price),
      stock_qty: stock_qty ? parseInt(stock_qty) : 20,
      image_url: image_url || '/assets/logo 1.jpeg'
    };
    db.lures.push(newLure);
    saveMockDB(db);
    return { rows: [newLure], rowCount: 1 };
  }

  // DELETE FROM lures
  if (sql.includes('DELETE FROM lures WHERE id = $1')) {
    const id = parseInt(params[0]);
    db.lures = db.lures.filter(l => l.id !== id);
    saveMockDB(db);
    return { rows: [], rowCount: 1 };
  }

  // 11. UPDATE lures (simple)
  if (sql.includes('UPDATE lures SET price = $1, stock_qty = $2 WHERE id = $3')) {
    const [price, stock_qty, id] = params;
    const lure = db.lures.find(l => l.id === parseInt(id));
    if (lure) {
      lure.price = parseFloat(price);
      lure.stock_qty = parseInt(stock_qty);
      saveMockDB(db);
    }
    return { rows: lure ? [lure] : [], rowCount: lure ? 1 : 0 };
  }

  // 11b. UPDATE lures (full)
  if (sql.includes('UPDATE lures SET name = $1, price = $2, stock_qty = $3, image_url = $4 WHERE id = $5')) {
    const [name, price, stock_qty, image_url, id] = params;
    const lure = db.lures.find(l => l.id === parseInt(id));
    if (lure) {
      lure.name = name;
      lure.price = parseFloat(price);
      lure.stock_qty = parseInt(stock_qty);
      lure.image_url = image_url || '/assets/logo 1.jpeg';
      saveMockDB(db);
    }
    return { rows: lure ? [lure] : [], rowCount: lure ? 1 : 0 };
  }

  // 12. SELECT * FROM damages
  if (sql.includes('SELECT * FROM damages')) {
    // Join with booking user info
    const joined = db.damages.map((d) => {
      const b = db.bookings.find((booking) => booking.id === d.booking_id) || {};
      const u = db.users.find((user) => user.id === b.user_id) || {};
      return {
        ...d,
        customer_name: u.full_name,
        booking_status: b.status
      };
    });
    joined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: joined, rowCount: joined.length };
  }

  // 13. INSERT INTO damages
  if (sql.includes('INSERT INTO damages')) {
    const [booking_id, damage_type, fee_applied, description, status] = params;
    const newDamage = {
      id: crypto.randomUUID(),
      booking_id,
      damage_type,
      fee_applied: parseFloat(fee_applied),
      description: description || '',
      status: status || 'pending',
      created_at: new Date().toISOString()
    };
    db.damages.push(newDamage);

    // Update booking status to 'damaged'
    const booking = db.bookings.find((b) => b.id === booking_id);
    if (booking) {
      booking.status = 'damaged';
    }

    saveMockDB(db);
    return { rows: [newDamage], rowCount: 1 };
  }

  // UPDATE damages status
  if (sql.includes('UPDATE damages SET status = $1 WHERE id = $2')) {
    const [status, id] = params;
    const damage = db.damages.find(d => d.id === id);
    if (damage) {
      damage.status = status;
      saveMockDB(db);
    }
    return { rows: damage ? [damage] : [], rowCount: damage ? 1 : 0 };
  }

  // 14. SELECT * FROM fish_species
  if (sql.includes('SELECT * FROM fish_species')) {
    return { rows: db.fish_species, rowCount: db.fish_species.length };
  }

  // INSERT INTO fish_species
  if (sql.includes('INSERT INTO fish_species')) {
    const [name, description, image_url] = params;
    const newFish = {
      id: db.fish_species.length > 0 ? Math.max(...db.fish_species.map(f => f.id)) + 1 : 1,
      name,
      description,
      image_url: image_url || '/assets/logo 1.jpeg'
    };
    db.fish_species.push(newFish);
    saveMockDB(db);
    return { rows: [newFish], rowCount: 1 };
  }

  // DELETE FROM fish_species
  if (sql.includes('DELETE FROM fish_species WHERE id = $1')) {
    const id = parseInt(params[0]);
    db.fish_species = db.fish_species.filter(f => f.id !== id);
    saveMockDB(db);
    return { rows: [], rowCount: 1 };
  }

  // UPDATE fish_species
  if (sql.includes('UPDATE fish_species SET name = $1, description = $2, image_url = $3 WHERE id = $4')) {
    const [name, description, image_url, id] = params;
    const fish = db.fish_species.find(f => f.id === parseInt(id));
    if (fish) {
      fish.name = name;
      fish.description = description;
      fish.image_url = image_url || '/assets/logo 1.jpeg';
      saveMockDB(db);
    }
    return { rows: fish ? [fish] : [], rowCount: fish ? 1 : 0 };
  }

  // 15. SELECT * FROM restaurants
  if (sql.includes('SELECT * FROM restaurants')) {
    return { rows: db.restaurants, rowCount: db.restaurants.length };
  }

  // INSERT INTO restaurants
  if (sql.includes('INSERT INTO restaurants')) {
    const [name, map_link, distance, fee_estimate, image_url] = params;
    const newRest = {
      id: db.restaurants.length + 1,
      name,
      map_link,
      distance,
      fee_estimate,
      image_url: image_url || '/assets/logo 1.jpeg'
    };
    db.restaurants.push(newRest);
    saveMockDB(db);
    return { rows: [newRest], rowCount: 1 };
  }

  // DELETE restaurants
  if (sql.includes('DELETE FROM restaurants WHERE id = $1')) {
    const id = parseInt(params[0]);
    db.restaurants = db.restaurants.filter(r => r.id !== id);
    saveMockDB(db);
    return { rows: [], rowCount: 1 };
  }

  // 16. SELECT * FROM site_content
  if (sql.includes('SELECT * FROM site_content') && !sql.includes('section_key')) {
    return { rows: db.site_content, rowCount: db.site_content.length };
  }

  if (sql.includes("SELECT * FROM site_content WHERE section_key = 'locations'")) {
    const item = db.site_content.find(sc => sc.section_key === 'locations');
    return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
  }

  if (sql.includes("SELECT * FROM site_content WHERE section_key = 'homepage'")) {
    const item = db.site_content.find(sc => sc.section_key === 'homepage');
    return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
  }

  if (sql.includes("SELECT * FROM site_content WHERE section_key = 'general_broken_images'")) {
    const item = db.site_content.find(sc => sc.section_key === 'general_broken_images');
    return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
  }

  // UPDATE site_content
  if (sql.includes('UPDATE site_content SET content_data = $1 WHERE section_key = $2')) {
    const [content_data, section_key] = params;
    let item = db.site_content.find(sc => sc.section_key === section_key);
    if (item) {
      item.content_data = typeof content_data === 'string' ? JSON.parse(content_data) : content_data;
    } else {
      item = {
        section_key,
        content_data: typeof content_data === 'string' ? JSON.parse(content_data) : content_data
      };
      db.site_content.push(item);
    }
    saveMockDB(db);
    return { rows: [item], rowCount: 1 };
  }

  // 17. SELECT * FROM contact_messages
  if (sql.includes('SELECT * FROM contact_messages')) {
    db.contact_messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: db.contact_messages, rowCount: db.contact_messages.length };
  }

  // SELECT * FROM damage_policies
  if (sql.includes('SELECT * FROM damage_policies')) {
    return { rows: db.damage_policies || [], rowCount: (db.damage_policies || []).length };
  }

  // INSERT INTO damage_policies
  if (sql.includes('INSERT INTO damage_policies')) {
    const [name, price, image_url, broken_images] = params;
    const newPolicy = {
      id: db.damage_policies && db.damage_policies.length > 0 
        ? Math.max(...db.damage_policies.map(p => p.id)) + 1 
        : 1,
      name,
      price: parseFloat(price),
      image_url: image_url || '',
      broken_images: broken_images ? JSON.parse(broken_images) : []
    };
    if (!db.damage_policies) db.damage_policies = [];
    db.damage_policies.push(newPolicy);
    saveMockDB(db);
    return { rows: [newPolicy], rowCount: 1 };
  }

  // DELETE FROM damage_policies
  if (sql.includes('DELETE FROM damage_policies WHERE id = $1')) {
    const id = parseInt(params[0]);
    if (db.damage_policies) {
      db.damage_policies = db.damage_policies.filter(p => p.id !== id);
    }
    saveMockDB(db);
    return { rows: [], rowCount: 1 };
  }

  // UPDATE damage_policies
  if (sql.includes('UPDATE damage_policies SET name = $1, price = $2, image_url = $3 WHERE id = $4')) {
    const [name, price, image_url, id] = params;
    const policy = db.damage_policies.find(p => p.id === parseInt(id));
    if (policy) {
      policy.name = name;
      policy.price = parseFloat(price);
      policy.image_url = image_url || '';
      saveMockDB(db);
    }
    return { rows: policy ? [policy] : [], rowCount: policy ? 1 : 0 };
  }

  // SELECT * FROM guides
  if (sql.includes('SELECT * FROM guides')) {
    return { rows: db.guides || [], rowCount: (db.guides || []).length };
  }

  // INSERT INTO guides
  if (sql.includes('INSERT INTO guides')) {
    const [name, experience, description, image_url] = params;
    const newGuide = {
      id: db.guides && db.guides.length > 0
        ? Math.max(...db.guides.map(g => g.id)) + 1
        : 1,
      name,
      experience,
      description,
      image_url: image_url || '/assets/logo 1.jpeg'
    };
    if (!db.guides) db.guides = [];
    db.guides.push(newGuide);
    saveMockDB(db);
    return { rows: [newGuide], rowCount: 1 };
  }

  // UPDATE guides
  if (sql.includes('UPDATE guides SET name = $1, experience = $2, description = $3, image_url = $4 WHERE id = $5')) {
    const [name, experience, description, image_url, id] = params;
    const guide = db.guides.find(g => g.id === parseInt(id));
    if (guide) {
      guide.name = name;
      guide.experience = experience;
      guide.description = description;
      guide.image_url = image_url || '/assets/logo 1.jpeg';
      saveMockDB(db);
    }
    return { rows: guide ? [guide] : [], rowCount: guide ? 1 : 0 };
  }

  // DELETE FROM guides
  if (sql.includes('DELETE FROM guides WHERE id = $1')) {
    const id = parseInt(params[0]);
    if (db.guides) {
      db.guides = db.guides.filter(g => g.id !== id);
    }
    saveMockDB(db);
    return { rows: [], rowCount: 1 };
  }

  // INSERT INTO contact_messages
  if (sql.includes('INSERT INTO contact_messages')) {
    const [name, email, phone, message] = params;
    const newMessage = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      message,
      created_at: new Date().toISOString()
    };
    db.contact_messages.push(newMessage);
    saveMockDB(db);
    return { rows: [newMessage], rowCount: 1 };
  }

  // 18. UPDATE bookings SET status = $1 WHERE id = $2
  if (sql.includes('UPDATE bookings SET status = $1') && !sql.includes('payment_status')) {
    const [status, id] = params;
    const booking = db.bookings.find((b) => b.id === id);
    if (booking) {
      booking.status = status;
      // Auto-increment back gear on Returned!
      if (status === 'returned' || status === 'Returned') {
        const poles = db.inventory.find(i => i.item_name === 'Fishing Poles');
        const boxes = db.inventory.find(i => i.item_name === 'Tackleboxes');
        if (poles) poles.available_qty = Math.min(poles.total_qty, poles.available_qty + booking.pole_quantity);
        if (boxes) boxes.available_qty = Math.min(boxes.total_qty, boxes.available_qty + booking.pole_quantity);
      }
      saveMockDB(db);
    }
    return { rows: booking ? [booking] : [], rowCount: booking ? 1 : 0 };
  }

  // 19. UPDATE bookings SET payment_status = $1 WHERE id = $2
  if (sql.includes('UPDATE bookings SET payment_status = $1')) {
    const [payment_status, id] = params;
    const booking = db.bookings.find((b) => b.id === id);
    if (booking) {
      booking.payment_status = payment_status;
      saveMockDB(db);
    }
    return { rows: booking ? [booking] : [], rowCount: booking ? 1 : 0 };
  }

  // General select all profiles (admin list)
  if (sql.includes('SELECT * FROM users') && !sql.includes('email')) {
    return { rows: db.users, rowCount: db.users.length };
  }

  // Fallback default
  console.warn(`Unmatched SQL query in mock translation layer: "${sql}". Returning empty list.`);
  return { rows: [], rowCount: 0 };
}

// Unified Query Handler
export async function query(text, params) {
  // If we are already in local fallback mode
  if (isFallbackMode) {
    return handleMockQuery(text, params);
  }

  const p = getPool();
  if (!p) {
    return handleMockQuery(text, params);
  }

  try {
    const res = await p.query(text, params);
    return res;
  } catch (error) {
    // If it's a connection/network error, failover to mock JSON DB dynamically!
    if (
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.message.includes('timeout') ||
      error.message.includes('connect')
    ) {
      isFallbackMode = true;
      console.warn(
        'Supabase PostgreSQL database connection timed out or is offline. Activating localized JSON Mock Database dynamic fallback.',
        error.message
      );
      return handleMockQuery(text, params);
    }
    throw error;
  }
}

export default { query };
