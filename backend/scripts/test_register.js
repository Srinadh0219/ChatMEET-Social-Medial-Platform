const http = require('http');

const data = JSON.stringify({
  name: 'John Doe',
  email: 'johndoe222@example.com',
  password: 'password123',
  password2: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 6000,
  path: '/api/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
