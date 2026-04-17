const net = require('net');

const port = 3000;

const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\x1b[31m%s\x1b[0m', `\n[CRITICAL ERROR] Port ${port} is currently in use by another application!`);
    console.error('\x1b[33m%s\x1b[0m', `Next.js normally auto-switches to 3001, but doing so breaks the backend API configuration.`);
    console.error(`Please kill the process holding port ${port} before starting the frontend.\n`);
    process.exit(1);
  }
});

server.once('listening', () => {
  server.close(() => {
    process.exit(0);
  });
});

server.listen(port);
