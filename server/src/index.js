require('dotenv').config();
const app = require('./app');
const { initDb } = require('./db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDb();
    const server = app.listen(PORT, () => {
      console.log(`ReleaseCheck Server running on port ${PORT}`);
    });

    const shutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to initialize database and start server:', err);
    process.exit(1);
  }
};

startServer();
