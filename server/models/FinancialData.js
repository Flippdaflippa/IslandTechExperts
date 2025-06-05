const mongoose = require('mongoose');

const FinancialDataSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  revenue: {
    total: Number,
    byProduct: [{
      productId: String,
      amount: Number,
      title: String
    }],
    byChannel: [{
      channel: String, // online_store, pos, mobile_app, etc.
      amount: Number
    }],
    afterLosses: Number, // New field for revenue after losses
    recurringRevenue: Number,
    refunds: Number
  },
  costs: {
    inventory: Number,
    shipping: {
      total: Number,
      domestic: Number,
      international: Number,
      returns: Number
    },
    marketing: {
      total: Number,
      advertising: Number,
      promotions: Number,
      discounts: Number
    },
    brokerFees: Number,
    platformFees: {
      total: Number,
      subscriptionFees: Number,
      transactionFees: Number,
      paymentProcessingFees: Number
    },
    operationalCosts: {
      storage: Number,
      packaging: Number,
      handling: Number,
      customerService: Number
    },
    otherFees: Number
  },
  taxes: {
    salesTax: {
      collected: Number,
      remitted: Number
    },
    vatTax: {
      collected: Number,
      remitted: Number
    },
    stateTax: {
      collected: Number,
      remitted: Number
    },
    otherTaxes: Number
  },
  inventory: {
    totalItems: Number,
    totalValue: Number,
    products: [{
      productId: String,
      sku: String,
      title: String,
      quantity: Number,
      value: Number,
      variantId: String,
      variantTitle: String,
      restockPoint: Number,
      lastRestockDate: Date
    }],
    lowStock: [{
      productId: String,
      sku: String,
      quantity: Number,
      restockNeeded: Number
    }],
    outOfStock: [{
      productId: String,
      sku: String,
      lastInStock: Date
    }]
  },
  profitMetrics: {
    grossProfit: Number,
    netProfit: Number,
    profitMargin: Number,
    operatingMargin: Number,
    revenueAfterLosses: Number, // New field for revenue after losses calculation
    returnOnInvestment: Number
  },
  unitsSold: {
    total: Number,
    byProduct: [{
      productId: String,
      title: String,
      quantity: Number,
      revenue: Number
    }],
    byChannel: [{
      channel: String,
      quantity: Number
    }]
  },
  customerMetrics: {
    totalCustomers: Number,
    newCustomers: Number,
    returningCustomers: Number,
    averageOrderValue: Number,
    customerLifetimeValue: Number
  },
  paymentMetrics: {
    methodBreakdown: [{
      method: String,
      count: Number,
      amount: Number
    }],
    pendingPayments: Number,
    failedPayments: Number
  },
  fulfillmentMetrics: {
    ordersProcessed: Number,
    ordersShipped: Number,
    ordersPending: Number,
    averageProcessingTime: Number,
    averageShippingTime: Number,
    returnRate: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FinancialData', FinancialDataSchema); 