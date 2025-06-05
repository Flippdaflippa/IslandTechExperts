import React, { useEffect, useState } from 'react';
import {
  Page,
  Layout,
  Card,
  DataTable,
  Spinner,
  Banner,
  Button,
  Icon,
  TextStyle
} from '@shopify/polaris';
import { RefreshMinor, AnalyticsMinor } from '@shopify/polaris-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../styles/theme.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/financial/overview');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const updateData = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/financial/update', { method: 'POST' });
      await fetchData();
    } catch (err) {
      setError('Failed to update financial data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Page title="Financial Analysis">
        <div className="loading-container">
          <Spinner size="large" />
          <p>Loading your financial insights...</p>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Financial Analysis">
        <Banner status="critical">{error}</Banner>
      </Page>
    );
  }

  const profitMetricsData = {
    labels: ['Gross Profit', 'Net Profit'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [data?.profitMetrics?.grossProfit || 0, data?.profitMetrics?.netProfit || 0],
        backgroundColor: 'rgba(100, 82, 229, 0.1)',
        borderColor: '#6452e5',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const renderMetricCard = (title, value, icon, trend) => (
    <div className="glass-card metric-card">
      <div className="metric-header">
        <Icon source={icon} />
        <h3>{title}</h3>
      </div>
      <div className="metric-value">{value}</div>
      {trend && (
        <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );

  return (
    <div className="gradient-background">
      <Page
        title={
          <div className="page-title">
            <h1>Financial Analysis</h1>
            <TextStyle variation="subdued">Last updated: {new Date(data?.lastUpdated).toLocaleString()}</TextStyle>
          </div>
        }
        primaryAction={
          <Button
            primary
            onClick={updateData}
            loading={isRefreshing}
            icon={RefreshMinor}
          >
            Refresh Data
          </Button>
        }
      >
        <Layout>
          {/* Key Metrics */}
          <Layout.Section>
            <div className="metrics-grid">
              {renderMetricCard(
                'Total Revenue',
                `$${data?.revenue?.total?.toFixed(2) || '0.00'}`,
                AnalyticsMinor,
                5.2
              )}
              {renderMetricCard(
                'Profit Margin',
                `${data?.profitMetrics?.profitMargin?.toFixed(2) || '0.00'}%`,
                AnalyticsMinor,
                2.8
              )}
              {renderMetricCard(
                'Units Sold',
                data?.unitsSold?.total || 0,
                AnalyticsMinor,
                -1.5
              )}
              {renderMetricCard(
                'Inventory Value',
                `$${data?.inventory?.totalValue?.toFixed(2) || '0.00'}`,
                AnalyticsMinor,
                3.7
              )}
            </div>
          </Layout.Section>

          {/* Charts Section */}
          <Layout.Section>
            <Card title="Profit Overview" sectioned>
              <div className="chart-container">
                <Line
                  data={profitMetricsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: 'rgba(255, 255, 255, 0.8)',
                          font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Gross vs Net Profit',
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                          size: 16,
                          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                      }
                    },
                    scales: {
                      y: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.8)'
                        }
                      },
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.8)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Layout.Section>

          {/* Detailed Tables */}
          <Layout.Section secondary>
            <Card title="Costs & Taxes">
              <Card.Section>
                <DataTable
                  columnContentTypes={['text', 'numeric']}
                  headings={['Category', 'Amount']}
                  rows={[
                    ['Inventory', `$${data?.costs?.inventory?.toFixed(2) || '0.00'}`],
                    ['Shipping', `$${data?.costs?.shipping?.toFixed(2) || '0.00'}`],
                    ['Marketing', `$${data?.costs?.marketing?.toFixed(2) || '0.00'}`],
                    ['Platform Fees', `$${data?.costs?.platformFees?.toFixed(2) || '0.00'}`],
                    ['Broker Fees', `$${data?.costs?.brokerFees?.toFixed(2) || '0.00'}`],
                    ['Sales Tax', `$${data?.taxes?.salesTax?.toFixed(2) || '0.00'}`],
                    ['VAT', `$${data?.taxes?.vatTax?.toFixed(2) || '0.00'}`],
                  ]}
                />
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
} 