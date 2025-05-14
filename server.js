import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';

const app = express();

//Create __dirname and __filename variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Declare important (semi-global) variables
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
/**
 * Configures the Express Server
*/


// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory (where your templates are located)
app.set('views', path.join(__dirname, 'src/views'));

// Middleware to add current year to res.locals
app.use((req, res, next) => {
    // Get the current year for copyright notice
    res.locals.currentYear = new Date().getFullYear();

    // Add NODE_ENV for all views
    res.locals.NODE_ENV = process.env.NODE_ENV || 'development';

    next();
});

/**
 * Middleware Functions
 */

app.use((req, res, next) => {
    console.log(`Method: ${req.method}, URL: ${req.url}`);
    next(); // Pass control to the next middleware or route
});

// Global middleware to set a custom header
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Express Middleware Tutorial');
    next();
});

// Global middleware to measure request processing time
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const end = Date.now();
        const processingTime = end - start;
        console.log(`${req.method} ${req.url} - Processing time: ${processingTime}ms`);
    });
    
    next();
})

    // Middleware to validate display parameter
    const validateDisplayMode = (req, res, next) => {
        const { display } = req.params;
        if (display !== 'grid' && display !== 'details') {
            return res.status(400).send('Invalid display mode: must be either "grid" or "details".');   
        }
        next();
    }

    app.use((req, res, next) => {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };

        res.locals.timestamp = now.toLocaleDateString('en-US', options);

        next();
    })
/**
 * Routes
 */
app.get('/', (req, res) => {
    const title = "Home"
    res.render('home', { title });
});

app.get('/about', (req, res) => {
        const title = "About";
        res.render('about', { title });

});

app.get('/contact', (req, res) => {
    const title = "Contact";
    res.render('contact', {title});
});

//Basic route with parameters
    app.get('/explore/:category/:id', (req, res) => {
        const { category, id } = req.params;
        const { sort = 'default', filter = 'none' } = req.query;
        console.log(`Category: ${category}, ID: ${id}, Sort: ${sort}, Filter: ${filter}`);

        const title = `Exploring ${category}`;
    
        res.render('explore', { title, category, id, sort, filter });

});

// Products page route with display mode validation
app.get('/products/:display', validateDisplayMode, (req, res) => {
    const title = "Our Products";
    const { display } = req.params;

    // Sample product data
    const products = [
        {
            id: 1,
            name: "Kindle E-Reader",
            description: "Lightweight e-reader with a glare-free display and weeks of battery life.",
            price: 149.99,
            image: "https://picsum.photos/id/367/800/600"
        },
        {
            id: 2,
            name: "Vintage Film Camera",
            description: "Capture timeless moments with this class vintage film camera, perfect for photography enthusiasts.",
            price: 199.99,
            image: "https://picsum.photos/id/250/800/600"
        }
    ];

    res.render('products', {title, products, display });
});
 
// Default products route (redirects to grid view)
app.get('/products', (req, res) => {
    res.redirect('/products/grid');
});


/**
 * Error Handling Middleware
 */

//Catch-all middleware for unmatched routes (404)
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);  // Forward to the global error handler
});
// Test route that explicity creates and forwards  an error
app.get('/manual-error', (req, res, next) => {
    const err = new Error('This is a manually triggered error');
    err.status = 500;
    next(err); // Forward to the global error handler
});

//Global error handler middleware
app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error(err.stack);

    // Set default status and determine error type
    const status = err.status || 500;
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Internal Server Error',
        error: err.message,
        stack: err.stack,
        code: err.status,
        NODE_ENV,
        PORT
    };
    
    // Render the appropriate template based on status code
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
});


// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

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