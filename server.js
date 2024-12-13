const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/winston');


// Connect to MongoDB
// 

const PORT = config.port || 4000;
let server;

// Function to start the server
const startServer = () => {
    server = http.createServer(app);


    server.listen(PORT, () => {
        logger.info(
            `Server running on port ${PORT} in ${config.nodeEnv} mode. Link: http://localhost:${PORT}`
        );
    });

    process.on('uncaughtException', (error) => {
        logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
    });

    process.on('unhandledRejection', (reason) => {
        logger.error(`Unhandled Rejection: ${reason}\n${reason?.stack || ''}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

// Function to gracefully shut down the server
const shutdown = async () => {
    logger.warn('Received shutdown signal, shutting down gracefully...');


    server.close((err) => {
        if (err) {
            logger.error('Error during server shutdown:', err);
            process.exit(1);
        }
        logger.info('Server shutdown complete.');
        process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
        logger.error('Force shutdown: Timeout exceeded.');
        process.exit(1);
    }, 10000); // 10 seconds
};

// Start the server
startServer();
