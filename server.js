import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';

const app = express();

//Create __dirname and __filename variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Configures the Express Server
*/

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory (where your templates are located)
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Routes
 */
app.get('/', (req, res) => {
    const title = 'Home Page';
    const content = '<h1>Welcome to the Home Page</h1><p>This is the main content of the home page.</p>';
    res.render('index', { title, content, NODE_ENV, PORT });
});

app.get('/', (req, res) => {
    const title = 'About Page';
    const content = '<h1>Welcome to the About Page</h1><p>This is the main content of the about page.</p>';
    res.render('about', {title, content});
});

app.get('/', (req, res) => {
    const title = 'Contact Page';
    const content = '<h1>Welcome to the Contact Page</h1><p>This is the main content of the contact page.</p>';
    res.render('contact', {title, content});
});
// Declare important (semi-global) variables
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;


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