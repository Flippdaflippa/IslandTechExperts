const FinancialData = require('../models/FinancialData');

module.exports = function(app, shopify) {
  // Get financial overview
  app.get('/api/financial/overview', async (req, res) => {
    try {
      const session = await shopify.validateAuthenticatedSession(req, res);
      const shopId = session.shop;
      
      const latestData = await FinancialData.findOne({ shopId }).sort({ date: -1 });
      res.json(latestData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update financial data
  app.post('/api/financial/update', async (req, res) => {
    try {
      const session = await shopify.validateAuthenticatedSession(req, res);
      const client = new shopify.clients.Rest({ session });

      // Fetch all required data from Shopify
      const [orders, products, customers, payouts] = await Promise.all([
        client.get({ path: 'orders' }),
        client.get({ path: 'products' }),
        client.get({ path: 'customers' }),
        client.get({ path: 'shopify_payments/payouts' })
      ]);
      
      // Calculate financial metrics
      const financialData = await calculateFinancialMetrics(
        orders.body,
        products.body,
        customers.body,
        payouts.body,
        session.shop
      );
      
      // Save to database
      await FinancialData.findOneAndUpdate(
        { shopId: session.shop, date: new Date() },
        financialData,
        { upsert: true }
      );

      res.json({ success: true, data: financialData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

async function calculateFinancialMetrics(orders, products, customers, payouts, shopId) {
  const revenue = calculateRevenue(orders);
  const costs = calculateCosts(orders, payouts);
  const taxes = calculateTaxes(orders);
  const inventory = calculateInventory(products);
  const unitsSold = calculateUnitsSold(orders);
  const customerMetrics = calculateCustomerMetrics(customers, orders);
  const paymentMetrics = calculatePaymentMetrics(orders);
  const fulfillmentMetrics = calculateFulfillmentMetrics(orders);
  
  // Calculate profit metrics
  const grossProfit = revenue.total - costs.inventory - costs.shipping.total;
  const operatingCosts = 
    costs.marketing.total +
    costs.brokerFees +
    costs.platformFees.total +
    costs.operationalCosts.storage +
    costs.operationalCosts.packaging +
    costs.operationalCosts.handling +
    costs.operationalCosts.customerService +
    costs.otherFees;

  const netProfit = grossProfit - operatingCosts;
  const profitMargin = (netProfit / revenue.total) * 100;
  const operatingMargin = ((grossProfit - operatingCosts) / revenue.total) * 100;
  const revenueAfterLosses = revenue.total - Math.abs(Math.min(netProfit, 0));

  return {
    shopId,
    date: new Date(),
    revenue: {
      ...revenue,
      afterLosses: revenueAfterLosses
    },
    costs,
    taxes,
    inventory,
    profitMetrics: {
      grossProfit,
      netProfit,
      profitMargin,
      operatingMargin,
      revenueAfterLosses,
      returnOnInvestment: (netProfit / (costs.inventory + operatingCosts)) * 100
    },
    unitsSold,
    customerMetrics,
    paymentMetrics,
    fulfillmentMetrics
  };
}

function calculateRevenue(orders) {
  const revenue = {
    total: 0,
    byProduct: [],
    byChannel: [],
    recurringRevenue: 0,
    refunds: 0
  };
  
  orders.forEach(order => {
    const orderTotal = parseFloat(order.total_price);
    revenue.total += orderTotal;

    // Calculate by product
    order.line_items.forEach(item => {
      const existingProduct = revenue.byProduct.find(p => p.productId === item.product_id);
      const amount = parseFloat(item.price) * item.quantity;
      
      if (existingProduct) {
        existingProduct.amount += amount;
      } else {
        revenue.byProduct.push({
          productId: item.product_id,
          title: item.title,
          amount
        });
      }
    });

    // Calculate by channel
    const channel = order.source_name || 'online_store';
    const existingChannel = revenue.byChannel.find(c => c.channel === channel);
    if (existingChannel) {
      existingChannel.amount += orderTotal;
    } else {
      revenue.byChannel.push({
        channel,
        amount: orderTotal
      });
    }

    // Track refunds
    if (order.refunds && order.refunds.length > 0) {
      revenue.refunds += order.refunds.reduce((sum, refund) => 
        sum + parseFloat(refund.amount), 0);
    }
  });

  return revenue;
}

function calculateCosts(orders, payouts) {
  const costs = {
    inventory: 0,
    shipping: {
      total: 0,
      domestic: 0,
      international: 0,
      returns: 0
    },
    marketing: {
      total: 0,
      advertising: 0,
      promotions: 0,
      discounts: 0
    },
    brokerFees: 0,
    platformFees: {
      total: 0,
      subscriptionFees: 0,
      transactionFees: 0,
      paymentProcessingFees: 0
    },
    operationalCosts: {
      storage: 0,
      packaging: 0,
      handling: 0,
      customerService: 0
    },
    otherFees: 0
  };

  orders.forEach(order => {
    // Inventory costs
    costs.inventory += order.line_items.reduce((sum, item) => 
      sum + (parseFloat(item.cost_price || 0) * item.quantity), 0);

    // Shipping costs
    const shippingCost = parseFloat(order.shipping_lines[0]?.price || 0);
    costs.shipping.total += shippingCost;
    
    if (order.shipping_address?.country_code === order.billing_address?.country_code) {
      costs.shipping.domestic += shippingCost;
    } else {
      costs.shipping.international += shippingCost;
    }

    // Marketing costs - discounts
    costs.marketing.discounts += parseFloat(order.total_discounts || 0);

    // Platform fees
    costs.platformFees.transactionFees += order.total_price * 0.029; // Example Shopify fee
    costs.platformFees.paymentProcessingFees += order.total_price * 0.003; // Example payment processing fee
  });

  // Calculate total platform fees
  costs.platformFees.total = 
    costs.platformFees.subscriptionFees +
    costs.platformFees.transactionFees +
    costs.platformFees.paymentProcessingFees;

  // Calculate total marketing costs
  costs.marketing.total = 
    costs.marketing.advertising +
    costs.marketing.promotions +
    costs.marketing.discounts;

  return costs;
}

function calculateTaxes(orders) {
  const taxes = {
    salesTax: {
      collected: 0,
      remitted: 0
    },
    vatTax: {
      collected: 0,
      remitted: 0
    },
    stateTax: {
      collected: 0,
      remitted: 0
    },
    otherTaxes: 0
  };

  orders.forEach(order => {
    const taxLines = order.tax_lines || [];
    taxLines.forEach(tax => {
      const amount = parseFloat(tax.price);
      switch(tax.title.toLowerCase()) {
        case 'sales tax':
          taxes.salesTax.collected += amount;
          taxes.salesTax.remitted += amount;
          break;
        case 'vat':
          taxes.vatTax.collected += amount;
          taxes.vatTax.remitted += amount;
          break;
        case 'state tax':
          taxes.stateTax.collected += amount;
          taxes.stateTax.remitted += amount;
          break;
        default:
          taxes.otherTaxes += amount;
      }
    });
  });

  return taxes;
}

function calculateInventory(products) {
  const inventory = {
    totalItems: 0,
    totalValue: 0,
    products: [],
    lowStock: [],
    outOfStock: []
  };

  products.forEach(product => {
    product.variants.forEach(variant => {
      const quantity = variant.inventory_quantity || 0;
      const value = quantity * (variant.cost || 0);
      const restockPoint = variant.inventory_policy === 'continue' ? 0 : 5; // Example restock point

      inventory.totalItems += quantity;
      inventory.totalValue += value;

      const productInfo = {
        productId: product.id,
        sku: variant.sku || '',
        title: product.title,
        variantId: variant.id,
        variantTitle: variant.title,
        quantity,
        value,
        restockPoint,
        lastRestockDate: variant.updated_at
      };

      inventory.products.push(productInfo);

      // Check for low stock
      if (quantity > 0 && quantity <= restockPoint) {
        inventory.lowStock.push({
          productId: product.id,
          sku: variant.sku || '',
          quantity,
          restockNeeded: restockPoint - quantity
        });
      }

      // Check for out of stock
      if (quantity === 0) {
        inventory.outOfStock.push({
          productId: product.id,
          sku: variant.sku || '',
          lastInStock: variant.updated_at
        });
      }
    });
  });

  return inventory;
}

function calculateCustomerMetrics(customers, orders) {
  const metrics = {
    totalCustomers: customers.length,
    newCustomers: 0,
    returningCustomers: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0
  };

  // Calculate new vs returning customers
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  customers.forEach(customer => {
    const customerCreatedAt = new Date(customer.created_at);
    if (customerCreatedAt >= thirtyDaysAgo) {
      metrics.newCustomers++;
    }
  });

  metrics.returningCustomers = metrics.totalCustomers - metrics.newCustomers;

  // Calculate average order value and customer lifetime value
  if (orders.length > 0) {
    const totalOrderValue = orders.reduce((sum, order) => 
      sum + parseFloat(order.total_price), 0);
    metrics.averageOrderValue = totalOrderValue / orders.length;
    metrics.customerLifetimeValue = totalOrderValue / metrics.totalCustomers;
  }

  return metrics;
}

function calculatePaymentMetrics(orders) {
  const metrics = {
    methodBreakdown: [],
    pendingPayments: 0,
    failedPayments: 0
  };

  orders.forEach(order => {
    const method = order.payment_gateway_names[0] || 'unknown';
    const amount = parseFloat(order.total_price);

    const existingMethod = metrics.methodBreakdown.find(m => m.method === method);
    if (existingMethod) {
      existingMethod.count++;
      existingMethod.amount += amount;
    } else {
      metrics.methodBreakdown.push({
        method,
        count: 1,
        amount
      });
    }

    if (order.financial_status === 'pending') {
      metrics.pendingPayments++;
    } else if (order.financial_status === 'failed') {
      metrics.failedPayments++;
    }
  });

  return metrics;
}

function calculateFulfillmentMetrics(orders) {
  const metrics = {
    ordersProcessed: 0,
    ordersShipped: 0,
    ordersPending: 0,
    averageProcessingTime: 0,
    averageShippingTime: 0,
    returnRate: 0
  };

  let totalProcessingTime = 0;
  let totalShippingTime = 0;
  let totalReturns = 0;

  orders.forEach(order => {
    if (order.fulfillment_status === 'fulfilled') {
      metrics.ordersShipped++;
      
      const processedDate = new Date(order.processed_at);
      const fulfillmentDate = new Date(order.fulfillments[0]?.created_at);
      const processingTime = (fulfillmentDate - processedDate) / (1000 * 60 * 60); // hours
      totalProcessingTime += processingTime;
    } else if (order.fulfillment_status === null) {
      metrics.ordersPending++;
    }

    if (order.refunds && order.refunds.length > 0) {
      totalReturns++;
    }
  });

  metrics.ordersProcessed = orders.length;
  metrics.averageProcessingTime = totalProcessingTime / metrics.ordersShipped;
  metrics.returnRate = (totalReturns / orders.length) * 100;

  return metrics;
}

function calculateUnitsSold(orders) {
  const unitsSold = {
    total: 0,
    byProduct: []
  };

  orders.forEach(order => {
    order.line_items.forEach(item => {
      unitsSold.total += item.quantity;
      
      const existingProduct = unitsSold.byProduct.find(p => p.productId === item.product_id);
      if (existingProduct) {
        existingProduct.quantity += item.quantity;
      } else {
        unitsSold.byProduct.push({
          productId: item.product_id,
          quantity: item.quantity
        });
      }
    });
  });

  return unitsSold;
} 