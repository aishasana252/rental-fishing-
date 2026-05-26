const { Client } = require('pg');

async function testRegion(region) {
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 6543,
    user: 'postgres.xfmxvxnfsuojdprhhcoq',
    password: 'Reelfishingcompany2#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    const res = await client.query('SELECT COUNT(*) FROM users;');
    await client.end();
    return { success: true, count: res.rows[0].count };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function run() {
  const regions = [
    'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
    'sa-east-1', 'ca-central-1'
  ];
  
  console.log('Scanning poolers with unencoded password...');
  for (const region of regions) {
    process.stdout.write(`Testing ${region}... `);
    const result = await testRegion(region);
    if (result.success) {
      console.log(`\n\n🎉 SUCCESS! Connected to region: ${region}`);
      console.log(`Pooler configuration:`);
      console.log(`Host: aws-0-${region}.pooler.supabase.com`);
      return;
    } else {
      if (result.error.includes('tenant/user') || result.error.includes('Tenant or user not found')) {
        console.log('❌ Tenant not found');
      } else {
        console.log(`❌ ${result.error}`);
      }
    }
  }
}

run();
