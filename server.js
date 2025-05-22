import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
 
// Import route handlers from their new locations
import indexRoutes from './src/routes/index.js';
import productsRoutes from './src/routes/products/index.js';
 
// Import global middleware
import { addGlobalData } from './src/middleware/index.js';
 
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
const app = express();
 
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
app.use(addGlobalData);
 
/**
 * Routes
 */
app.use('/', indexRoutes);
app.use('/products', productsRoutes);
 
// 404 Error Handler
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err); // Forward to the global error handler
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
 
// Start the Express server on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});