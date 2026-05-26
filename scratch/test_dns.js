const dns = require('dns');

dns.resolve6('db.xfmxvxnfsuojdprhhcoq.supabase.co', (err, addresses) => {
  if (err) {
    console.error('dns.resolve6 failed:', err.message);
  } else {
    console.log('dns.resolve6 addresses:', addresses);
  }
});

dns.resolve4('db.xfmxvxnfsuojdprhhcoq.supabase.co', (err, addresses) => {
  if (err) {
    console.error('dns.resolve4 failed:', err.message);
  } else {
    console.log('dns.resolve4 addresses:', addresses);
  }
});

dns.lookup('db.xfmxvxnfsuojdprhhcoq.supabase.co', (err, address, family) => {
  if (err) {
    console.error('dns.lookup failed:', err.message);
  } else {
    console.log('dns.lookup address:', address, 'family: IPv' + family);
  }
});
