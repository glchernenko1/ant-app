import React, { useEffect, useState, } from 'react';
import { Layout, Select, Button, message, Card, Space, Typography } from 'antd';
import { api, Fiat, ExchangeSoup } from './services/api';
import ExchangeSoupForm from './components/ExchangeSoupForm';
import { PlusOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [fiats, setFiats] = useState<string[]>([]);
  const [selectedFiat, setSelectedFiat] = useState<string>();
  const [soups, setSoups] = useState<ExchangeSoup[]>([]);

  useEffect(() => {
    api.getFiats().then(setFiats);
  }, []);

  useEffect(() => {
    if (selectedFiat) {
      const savedSettings = api.getSavedSettings();
      if (savedSettings[selectedFiat]) {
        setSoups(savedSettings[selectedFiat].exchange_soups);
      } else {
        setSoups([]);
      }
    }
  }, [selectedFiat]);

  const handleFiatChange = (value: string) => {
    setSelectedFiat(value);
  };

  const handleSoupChange = (index: number, values: ExchangeSoup) => {
    const newSoups = [...soups];
    newSoups[index] = values;
    setSoups(newSoups);
  };

  const handleAddSoup = () => {
    const newSoup: ExchangeSoup = {
      name: '',
      average: 0,
      exchanges: [{
        exchange_name: '',
        banks: [],
        filter_buy: {
          min_amount: 0,
          max_amount: 0,
          min_price: 0,
          max_price: 0,
          payment_methods: []
        },
        filter_sell: {
          min_amount: 0,
          max_amount: 0,
          min_price: 0,
          max_price: 0,
          payment_methods: []
        }
      }]
    };
    setSoups([...soups, newSoup]);
  };

  const removeSoup = (index: number) => {
    setSoups(soups.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedFiat) {
      message.error('Please select a fiat');
      return;
    }

    if (soups.length === 0) {
      message.error('Please add at least one exchange soup');
      return;
    }

    try {
      const fiat: Fiat = {
        name: selectedFiat,
        exchange_soups: soups
      };

      await api.createFiat(fiat);
      message.success('Fiat settings saved successfully');
    } catch (error) {
      message.error('Failed to save fiat settings');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Title level={3} style={{ margin: '16px 0' }}>Server Settings</Title>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Select
              style={{ width: 200 }}
              placeholder="Select Fiat"
              value={selectedFiat}
              onChange={handleFiatChange}
              options={fiats.map(fiat => ({ label: fiat, value: fiat }))}
            />

            {selectedFiat && (
              <>
                {soups.map((soup, index) => (
                  <ExchangeSoupForm
                    key={index}
                    fiat={selectedFiat}
                    initialValues={soup}
                    onChange={values => handleSoupChange(index, values)}
                    isNew={soup.name === ''}
                    onRemove={() => removeSoup(index)}
                  />
                ))}

                <Button
                  type="dashed"
                  onClick={handleAddSoup}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Exchange Soup
                </Button>

                <Button
                  type="primary"
                  onClick={handleSubmit}
                  block
                >
                  Save Settings
                </Button>
              </>
            )}
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default App; 