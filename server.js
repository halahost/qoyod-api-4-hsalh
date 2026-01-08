/**
 * Qoyod API Proxy Server
 * Solves CORS issues by proxying requests to the Qoyod API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const QOYOD_API_BASE = 'https://api.qoyod.com/2.0';

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// Proxy endpoint for Qoyod API
app.all('/api/*', async (req, res) => {
    const apiPath = req.params[0]; // Get the path after /api/
    const targetUrl = `${QOYOD_API_BASE}/${apiPath}`;

    // Build query string
    const queryString = new URLSearchParams(req.query).toString();
    const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    console.log(`[${new Date().toISOString()}] ${req.method} ${fullUrl}`);

    try {
        // Forward the request to Qoyod API
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // Forward API-KEY header if present
        if (req.headers['api-key']) {
            fetchOptions.headers['API-KEY'] = req.headers['api-key'];
        }

        // Forward body for POST/PUT/PATCH requests
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(fullUrl, fetchOptions);

        // Get response data
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Forward relevant headers
        const headersToForward = ['x-total-count', 'x-total-pages', 'x-current-page'];
        headersToForward.forEach(header => {
            const value = response.headers.get(header);
            if (value) {
                res.set(header, value);
            }
        });

        // Send response
        res.status(response.status);

        if (typeof data === 'string') {
            res.send(data);
        } else {
            res.json(data);
        }

    } catch (error) {
        console.error(`[ERROR] ${error.message}`);
        res.status(500).json({
            error: 'Proxy Error',
            message: error.message,
            details: 'Failed to connect to Qoyod API'
        });
    }
});

// Get local IP address for network access
const os = require('os');
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIP();

// Start server on all interfaces (0.0.0.0) to allow network access
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║   🚀  Qoyod API Tester - Proxy Server                      ║');
    console.log('║                                                            ║');
    console.log(`║   Local:    http://localhost:${PORT}${' '.repeat(20 - PORT.toString().length)}║`);
    console.log(`║   Network:  http://${LOCAL_IP}:${PORT}${' '.repeat(20 - LOCAL_IP.length - PORT.toString().length)}║`);
    console.log('║                                                            ║');
    console.log('║   Open your browser and navigate to the URL above          ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
});
