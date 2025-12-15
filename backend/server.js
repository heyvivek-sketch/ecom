
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'supersecret';

// PayU Config
const PAYU_KEY = process.env.PAYU_MERCHANT_KEY;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    const formatted = products.map(p => {
        let imgs = [];
        try {
            // Prisma might return string if it's stored as JSON string in DB, or object if using Json type
            if (typeof p.images === 'string') {
                imgs = JSON.parse(p.images);
            } else {
                imgs = p.images || [];
            }
        } catch(e) { 
            imgs = [p.imageUrl]; 
        }
        return { ...p, images: Array.isArray(imgs) ? imgs : [p.imageUrl] };
    });
    res.json(formatted);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (product) {
        let imgs = [];
        try {
            if (typeof product.images === 'string') {
                imgs = JSON.parse(product.images);
            } else {
                imgs = product.images || [];
            }
        } catch(e) { imgs = [product.imageUrl]; }
        
        res.json({ ...product, images: Array.isArray(imgs) ? imgs : [product.imageUrl] });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.post('/api/products', authenticate, isAdmin, async (req, res) => {
  const { name, description, price, stock, category, imageUrl, images } = req.body;
  try {
    const product = await prisma.product.create({
        data: { 
            name, description, price, stock, category, imageUrl, 
            images: images // Prisma handles Json type automatically if defined in schema
        }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.delete('/api/products/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// --- ORDER ROUTES ---
app.post('/api/orders', authenticate, async (req, res) => {
  const { items, totalAmount, shippingAddress, txnId } = req.body;
  
  try {
    // Verify stock
    for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.id } });
        if (!product || product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
        }
    }

    const order = await prisma.order.create({
        data: {
        userId: req.user.id,
        totalAmount,
        shippingAddress,
        txnId,
        status: 'PENDING',
        items: {
            create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
            }))
        }
        }
    });
    
    // Decrease stock
    for (const item of items) {
        await prisma.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } }
        });
    }

    res.json(order);
  } catch (error) {
      res.status(500).json({ error: "Order creation failed" });
  }
});

app.get('/api/orders', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'ADMIN') {
        const orders = await prisma.order.findMany({ include: { items: true, user: true }, orderBy: { createdAt: 'desc' } });
        res.json(orders);
    } else {
        const orders = await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } });
        res.json(orders);
    }
  } catch (error) {
      res.status(500).json({ error: "Fetch orders failed" });
  }
});

app.put('/api/orders/:id/status', authenticate, isAdmin, async (req, res) => {
    const { status } = req.body;
    try {
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
});

// --- PAYU ROUTES ---
app.post('/api/payu/hash', authenticate, (req, res) => {
  const { txnid, amount, productinfo, firstname, email } = req.body;
  // hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|...|udf10|salt
  const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  res.json({ hash });
});

// PayU Webhook / Success Handler
app.post('/api/payu/webhook', async (req, res) => {
  const { txnid, status, amount, hash, email, firstname, productinfo } = req.body;
  
  // Verify hash
  // salt|status||||||udf5...udf1|email|firstname|productinfo|amount|txnid|key
  const hashString = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  if (calculatedHash !== hash) {
    return res.status(400).json({ error: 'Invalid Hash' });
  }

  if (status === 'success') {
    await prisma.order.update({
      where: { txnId: txnid },
      data: { status: 'PAID' }
    });
    
    await prisma.payment.create({
        data: {
            order: { connect: { txnId: txnid } },
            txnId,
            amount: parseFloat(amount),
            status,
            payuData: req.body
        }
    });
  } else {
    await prisma.order.update({
        where: { txnId: txnid },
        data: { status: 'FAILED' }
    });
  }

  // In production, you might not redirect from a webhook, 
  // but for the Success URL (surl) which is a POST, you should redirect the browser.
  // Assuming this route is used for surl/furl
  res.redirect(`${process.env.FRONTEND_URL}/#/order-success?txnid=${txnid}&amount=${amount}`);
});

app.get('/api/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalOrders = await prisma.order.count();
        const paidOrders = await prisma.order.findMany({ where: { status: 'PAID' } });
        const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
        res.json({ totalUsers, totalOrders, totalRevenue });
    } catch (error) {
        res.status(500).json({ error: "Stats failed" });
    }
});

// Bind to 0.0.0.0 to listen on all interfaces (fixes some localhost connection issues)
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
