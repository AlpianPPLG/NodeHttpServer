/**
 * Docker healthcheck script
 */

import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 3000,
};

const request = http.request(options, (response) => {
  if (response.statusCode === 200) {
    process.exit(0); // Healthy
  } else {
    process.exit(1); // Unhealthy
  }
});

request.on('error', () => {
  process.exit(1); // Unhealthy
});

request.on('timeout', () => {
  request.destroy();
  process.exit(1); // Unhealthy
});

request.end();