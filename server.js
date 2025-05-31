import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase, testConnection } from './src/models/setup.js';
import dashboardRoutes from './src/routes/dashboard/index.js';
 
// Import route handlers from their new locations
import indexRoutes from './src/routes/index.js';
import productsRoutes from './src/routes/products/index.js';
import testRoutes from './src/routes/test.js';
 
// Import global middleware
import { addGlobalData } from './src/middleware/index.js';

import { addNavigationData } from './src/middleware/index.js';

const app = express();

app.use(addNavigationData);
/**
 * Define important variables
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
 
/**
 * Create an instance of an Express application
 */
 
/**
 * Configure the Express server
 */
 
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
 
// Set the view engine to EJS
app.set('view engine', 'ejs');
 
// Set the views directory (where your templates are located)
app.set('views', path.join(__dirname, 'src/views'));
 
/**
 * Middleware
 */

app.use(express.json());

app.use(express.urlencoded({extended: true }));

app.use(addGlobalData);
 
/**
 * Routes
 */
app.use('/', indexRoutes);
app.use('/products', productsRoutes);
app.use('/test', testRoutes);
app.use('/dashboard', dashboardRoutes);
// 404 Error Handler
app.use((req, res, next) => {
    // Ignore error forwarding for expected missing assets
    const quiet404s = [
        '/favicon.ico',
        '/robots.txt'
    ];

    // Also skip any paths under /.well-known/
    const isQuiet404 = quiet404s.includes(req.path) || req.path.startsWith('/.well-known/');

    if (isQuiet404) {
        return res.status(404).send('Not Found');
    }

    // For all other routes, forward to the global error handler
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});
 
// Global Error Handler
app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error(err.stack);
 
    // Set default status and determine error type
    const status = err.status || 500;
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Internal Server Error',
        error: err.message,
        stack: err.stack
    };
 
    // Render the appropriate template based on status code
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
});
 
/**
 * Start the server
 */
 
// When in development mode, start a WebSocket server for live reloading
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');
 
    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });
 
        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });
 
        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}
 
// Test database connection and setup tables
testConnection()
    .then(() => setupDatabase())
    .then(() => {
        // Start your WebSocket server if you have one
        // startWebSocketServer();
 
        // Start the Express server
        app.listen(PORT, () => {
            console.log(`Server running on http://127.0.0.1:${PORT}`);
            console.log('Database connected and ready');
        });
    })
    .catch((error) => {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    });