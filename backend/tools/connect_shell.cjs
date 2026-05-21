const { io } = require('socket.io-client');

const socket = io('http://localhost:3000/shell', { transports: ['websocket'], reconnectionAttempts: 3, timeout: 5000 });

socket.on('connect', () => {
  console.log('client connected', socket.id);
  // keep the connection for a few seconds then close
  setTimeout(() => {
    socket.close();
    process.exit(0);
  }, 4000);
});

socket.on('connect_error', (err) => {
  console.error('connect_error', err && err.message ? err.message : err);
  process.exit(2);
});

socket.on('disconnect', (reason) => {
  console.log('disconnected', reason);
  process.exit(0);
});
