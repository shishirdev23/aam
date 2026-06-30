const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure orders.json exists
const initDb = async () => {
    try {
        const exists = await fs.pathExists(ORDERS_FILE);
        if (!exists) {
            await fs.writeJson(ORDERS_FILE, []);
            console.log('Database (orders.json) initialized.');
        }
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

// Routes
app.get('/', (req, res) => {
    res.send('Mango Store Server is running...');
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === '101202') {
        res.json({ success: true, token: 'admin-token-101202' });
    } else {
        res.status(401).json({ success: false, error: 'ভুল পাসওয়ার্ড!' });
    }
});

// Get all orders (for Admin)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await fs.readJson(ORDERS_FILE);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read orders' });
    }
});

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = {
            id: Date.now(),
            date: new Date().toISOString(),
            status: 'Pending',
            ...req.body
        };

        const orders = await fs.readJson(ORDERS_FILE);
        orders.push(newOrder);
        await fs.writeJson(ORDERS_FILE, orders, { spaces: 2 });

        console.log('New Order Received:', newOrder.id);
        res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder.id });
    } catch (err) {
        console.error('Error saving order:', err);
        res.status(500).json({ error: 'Failed to save order' });
    }
});

// Delete an order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const targetId = String(req.params.id);
        let orders = await fs.readJson(ORDERS_FILE);
        
        const initialLength = orders.length;
        orders = orders.filter(order => String(order.id) !== targetId);
        
        if (orders.length === initialLength) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await fs.writeJson(ORDERS_FILE, orders, { spaces: 2 });
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const targetId = String(req.params.id);
        const { status } = req.body;
        
        let orders = await fs.readJson(ORDERS_FILE);
        const orderIndex = orders.findIndex(order => String(order.id) === targetId);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        orders[orderIndex].status = status;
        await fs.writeJson(ORDERS_FILE, orders, { spaces: 2 });
        
        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
