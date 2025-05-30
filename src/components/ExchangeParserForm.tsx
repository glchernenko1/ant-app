import React, { useEffect, useState } from 'react';
import { Form, Select, Space, Typography, Divider, Button, Checkbox } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { api, ExchangeParser } from '../services/api';
import FilterForm from './FilterForm';

const { Title } = Typography;

interface ExchangeParserFormProps {
  fiat: string;
  initialValues?: ExchangeParser;
  onChange?: (values: ExchangeParser) => void;
  mode?: 'view' | 'edit';
  exchangeName?: string;
}

const ExchangeParserForm: React.FC<ExchangeParserFormProps> = ({
  fiat,
  initialValues,
  onChange,
  mode = 'view',
  exchangeName
}) => {
  const [form] = Form.useForm();
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [banks, setBanks] = useState<string[]>([]);
  const [currentExchange, setCurrentExchange] = useState<string>(exchangeName || '');
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [useSameFilters, setUseSameFilters] = useState(true);

  // Load available exchanges
  useEffect(() => {
    api.getExchanges().then(setExchanges);
  }, [fiat]);

  // Load banks for current exchange
  useEffect(() => {
    if (currentExchange) {
      api.getBanks(fiat, currentExchange).then(setBanks);
    }
  }, [currentExchange, fiat]);

  // Set initial values
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setCurrentExchange(initialValues.exchange_name);
    }
  }, [initialValues, form]);

  const handleValuesChange = (_: any, allValues: ExchangeParser) => {
    if (useSameFilters && allValues.filter_buy) {
      allValues.filter_sell = { ...allValues.filter_buy };
    }
    onChange?.(allValues);
  };

  const handleExchangeChange = (value: string) => {
    setCurrentExchange(value);
    form.setFieldsValue({ 
      exchange_name: value,
      banks: []
    });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleUseSameFiltersChange = (e: any) => {
    setUseSameFilters(e.target.checked);
    if (e.target.checked) {
      const buyFilter = form.getFieldValue('filter_buy');
      if (buyFilter) {
        form.setFieldsValue({ filter_sell: { ...buyFilter } });
        handleValuesChange(null, form.getFieldsValue());
      }
    }
  };

  const renderViewMode = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={5} style={{ margin: 0 }}>{currentExchange}</Title>
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={toggleEdit}
        />
      </div>
      
      <div>
        <strong>Banks:</strong> {form.getFieldValue('banks')?.join(', ')}
      </div>

      <Divider style={{ margin: '12px 0' }}>Buy Filter</Divider>
      <FilterForm
        initialValues={initialValues?.filter_buy}
        onChange={values => {
          form.setFieldsValue({ filter_buy: values });
          if (useSameFilters) {
            form.setFieldsValue({ filter_sell: { ...values } });
          }
          handleValuesChange(null, form.getFieldsValue());
        }}
        mode="view"
      />

      {!useSameFilters && (
        <>
          <Divider style={{ margin: '12px 0' }}>Sell Filter</Divider>
          <FilterForm
            initialValues={initialValues?.filter_sell}
            onChange={values => {
              form.setFieldsValue({ filter_sell: values });
              handleValuesChange(null, form.getFieldsValue());
            }}
            mode="view"
          />
        </>
      )}
    </Space>
  );

  const renderEditMode = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
    >
      {/* <Form.Item
        label="Exchange"
        name="exchange_name"
        rules={[{ required: true, message: 'Please select an exchange!' }]}
      >
        <Select
          placeholder="Select exchange"
          options={exchanges.map(exchange => ({ label: exchange, value: exchange }))}
          onChange={handleExchangeChange}
        />
      </Form.Item> */}

      <Form.Item
        label="Banks"
        name="banks"
        rules={[{ required: true, message: 'Please select banks!' }]}
      >
        <Select
          mode="multiple"
          options={banks.map(bank => ({ label: bank, value: bank }))}
          disabled={!currentExchange}
          placeholder="Select banks"
        />
      </Form.Item>

      <Divider style={{ margin: '12px 0' }}>Buy Filter</Divider>
      <FilterForm
        initialValues={initialValues?.filter_buy}
        onChange={values => {
          form.setFieldsValue({ filter_buy: values });
          if (useSameFilters) {
            form.setFieldsValue({ filter_sell: { ...values } });
          }
          handleValuesChange(null, form.getFieldsValue());
        }}
        mode="edit"
      />

      <Form.Item>
        <Checkbox
          checked={useSameFilters}
          onChange={handleUseSameFiltersChange}
        >
          Use same settings for sell filter
        </Checkbox>
      </Form.Item>

      {!useSameFilters && (
        <>
          <Divider style={{ margin: '12px 0' }}>Sell Filter</Divider>
          <FilterForm
            initialValues={initialValues?.filter_sell}
            onChange={values => {
              form.setFieldsValue({ filter_sell: values });
              handleValuesChange(null, form.getFieldsValue());
            }}
            mode="edit"
          />
        </>
      )}

      <Form.Item>
        <Button 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={toggleEdit}
          block
        >
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );

  return isEditing ? renderEditMode() : renderViewMode();
};

export default ExchangeParserForm; 