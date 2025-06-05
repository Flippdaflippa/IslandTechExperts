import React from 'react';
import { Card, Layout, Page } from '@shopify/polaris';

const Dashboard = () => {
  return (
    <Page title="Financial Dashboard">
      <Layout>
        <Layout.Section>
          <Card title="Revenue Overview">
            <Card.Section>
              {/* Revenue charts will go here */}
              <p>Revenue visualization coming soon...</p>
            </Card.Section>
          </Card>
        </Layout.Section>
        
        <Layout.Section secondary>
          <Card title="Quick Stats">
            <Card.Section>
              {/* Stats will go here */}
              <p>Financial metrics loading...</p>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Dashboard; 