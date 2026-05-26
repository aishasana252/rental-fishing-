const { query } = require('./src/lib/db');

async function check() {
  try {
    const res = await query("SELECT content_data FROM site_content WHERE section_key = 'homepage'");
    console.log(JSON.stringify(res.rows[0].content_data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
check();
