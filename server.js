const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint to get products
app.get('/api/products', (req, res) => {
    const productsPath = path.join(__dirname, 'data', 'products.json');
    fs.readFile(productsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading products file:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(JSON.parse(data));
    });
});

// API Endpoint for a mock Stripe payment (optional/demo)
app.post('/api/create-checkout-session', (req, res) => {
    // In a real application, you would interact with the Stripe API here.
    // We are mocking a successful response for the demo.
    setTimeout(() => {
        res.json({ url: '/checkout-success.html' });
    }, 1000);
});

// Fallback to index.html for unknown routes (SPA like behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
