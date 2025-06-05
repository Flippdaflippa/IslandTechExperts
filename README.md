# Shopify Financial Analyzer

A comprehensive financial analysis app for Shopify stores that provides detailed insights into your store's financial performance, including profit margins, inventory management, and tax calculations.

## Features

- Real-time financial metrics dashboard
- Profit and loss analysis
- Inventory tracking and valuation
- Sales tax and VAT calculations
- Detailed cost breakdown (shipping, marketing, platform fees, etc.)
- Units sold tracking by product
- Beautiful data visualizations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Shopify Partner account
- Shopify store with admin access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shopify-financial-analyzer.git
cd shopify-financial-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your configuration:
```
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
MONGODB_URI=mongodb://localhost:27017/shopify-financial-analyzer
HOST=https://your-app-domain.com
SCOPES=read_products,read_orders,read_inventory,read_financial_data,read_shopify_payments_payouts
```

4. Start the development server:
```bash
npm run dev
```

## Setting up in Shopify

1. Go to your Shopify Partner dashboard
2. Create a new app
3. Set the App URL to your development/production URL
4. Add the required scopes in the app settings
5. Copy the API key and secret to your `.env` file

## Usage

1. Install the app in your Shopify store
2. Navigate to the app in your Shopify admin panel
3. The dashboard will automatically load with your store's financial data
4. Use the "Refresh Data" button to update the metrics with the latest information

## Data Points Tracked

- Revenue
  - Total revenue
  - Revenue by product
- Costs
  - Inventory costs
  - Shipping costs
  - Marketing expenses
  - Platform fees
  - Broker fees
- Taxes
  - Sales tax
  - VAT
  - Other taxes
- Inventory
  - Current stock levels
  - Stock value
  - Product-wise breakdown
- Profit Metrics
  - Gross profit
  - Net profit
  - Profit margins
- Units Sold
  - Total units
  - Product-wise breakdown

## Security

This app uses Shopify's authentication system and secure API endpoints. All data is stored securely in your MongoDB instance. Make sure to:

- Keep your API keys secure
- Use environment variables for sensitive information
- Regularly update dependencies
- Follow Shopify's security best practices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 