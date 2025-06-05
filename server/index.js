require('dotenv').config();
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Shopify auth configuration
const shopify = new Shopify({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: [
    'read_products',
    'read_orders',
    'read_inventory',
    'read_financial_data',
    'read_shopify_payments_payouts'
  ],
  hostName: process.env.HOST.replace(/https:\/\//, ''),
  apiVersion: '2023-10',
  isEmbeddedApp: true
});

// Middleware
app.use(express.json());

// Routes
require('./routes/auth')(app, shopify);
require('./routes/analytics')(app, shopify);
require('./routes/financial')(app, shopify);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 