const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/check-auth',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Auth check:', data));
});
req.on('error', e => console.error('Error:', e));
req.end();
