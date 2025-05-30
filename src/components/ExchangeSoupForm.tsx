import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, message, Collapse, Select, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined, EditOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { api, ExchangeSoup, ExchangeParser } from '../services/api';
import ExchangeParserForm from './ExchangeParserForm';

const { Panel } = Collapse;


interface ExchangeSoupFormProps {
  fiat: string;
  initialValues?: ExchangeSoup;
  onChange?: (values: ExchangeSoup) => void;
  mode?: 'view' | 'edit';
  isNew?: boolean;
  onRemove?: () => void;
}

const defaultExchangeParser: ExchangeParser = {
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
};

const ExchangeSoupForm: React.FC<ExchangeSoupFormProps> = ({
  fiat,
  initialValues,
  onChange,
  mode = 'view',
  isNew = false,
  onRemove
}) => {
  const [form] = Form.useForm();
  const [exchangeOptions, setExchangeOptions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(mode === 'edit' || isNew);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  useEffect(() => {
    // Получаем список бирж для выпадающего списка
    api.getExchanges().then(setExchangeOptions);
  }, [fiat]);

  const handleValuesChange = (_: any, allValues: ExchangeSoup) => {
    onChange?.(allValues);
  };

  const handleExchangeChange = (index: number, values: ExchangeParser) => {
    const exchanges = form.getFieldValue('exchanges') || [];
    const newExchanges = [...exchanges];
    newExchanges[index] = values;
    form.setFieldsValue({ exchanges: newExchanges });
    handleValuesChange(null, { ...form.getFieldsValue(), exchanges: newExchanges });
  };

  const addExchange = () => {
    const exchanges = form.getFieldValue('exchanges') || [];
    const newExchanges = [...exchanges, { ...defaultExchangeParser }];
    form.setFieldsValue({ exchanges: newExchanges });
    handleValuesChange(null, { ...form.getFieldsValue(), exchanges: newExchanges });
  };

  const removeExchange = (index: number) => {
    if ((form.getFieldValue('exchanges') || []).length === 1) {
      message.warning('At least one exchange is required');
      return;
    }
    const exchanges = form.getFieldValue('exchanges') || [];
    const newExchanges = exchanges.filter((_: any, i: number) => i !== index);
    form.setFieldsValue({ exchanges: newExchanges });
    handleValuesChange(null, { ...form.getFieldsValue(), exchanges: newExchanges });
  };

  const renderViewMode = () => (
    <Card
      style={{ marginBottom: 16 }}
      headStyle={{ background: '#fafafa' }}
      title={initialValues?.name || 'Exchange Soup'}
      extra={
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditing(true)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={onRemove} />
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <strong>Average:</strong> {initialValues?.average}
      </div>
      <Collapse>
        {form.getFieldValue('exchanges')?.map((exchange: any, index: number) => (
          <Panel
            header={exchange.exchange_name || `Exchange ${index + 1}`}
            key={index}
            extra={
              (form.getFieldValue('exchanges') || []).length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={e => {
                    e.stopPropagation();
                    removeExchange(index);
                  }}
                />
              )
            }
          >
            <ExchangeParserForm
              fiat={fiat}
              initialValues={exchange}
              exchangeName={exchange.exchange_name}
              onChange={values => handleExchangeChange(index, values)}
              mode="view"
            />
          </Panel>
        ))}
      </Collapse>
    </Card>
  );

  const renderEditMode = () => (
    <Card
      style={{ marginBottom: 16 }}
      headStyle={{ background: '#fafafa' }}
      title={
        <Form form={form} layout="inline" initialValues={initialValues} style={{ margin: 0 }}>
          <Form.Item name="name" rules={[{ required: true, message: 'Please input soup name!' }]} style={{ margin: 0 }}>
            <Input placeholder="Enter soup name" bordered={false} style={{ fontSize: 22, fontWeight: 600, width: 200 }} />
          </Form.Item>
        </Form>
      }
      extra={
        <Space>
          <Button type="text" icon={<SaveOutlined />} onClick={() => setIsEditing(false)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={onRemove} />
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Average</span>}
          name="average"
          rules={[{ required: true, message: 'Please input average!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter average value"
            min={0}
          />
        </Form.Item>

        <Form.List name="exchanges">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Card
                  key={field.key}
                  type="inner"
                  title={
                    <Select
                      style={{ minWidth: 160 }}
                      placeholder="Choose exchange"
                      value={form.getFieldValue('exchanges')?.[index]?.exchange_name || undefined}
                      onChange={value => {
                        const exchanges = form.getFieldValue('exchanges') || [];
                        const newExchanges = [...exchanges];
                        newExchanges[index] = { ...newExchanges[index], exchange_name: value };
                        form.setFieldsValue({ exchanges: newExchanges });
                        handleValuesChange(null, { ...form.getFieldsValue(), exchanges: newExchanges });
                      }}
                      options={exchangeOptions.map(e => ({ label: e, value: e }))}
                    />
                  }
                  style={{ marginBottom: 16 }}
                  extra={
                    (form.getFieldValue('exchanges') || []).length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => {
                          remove(field.name);
                          removeExchange(index);
                        }}
                      />
                    )
                  }
                >
                  <ExchangeParserForm
                    fiat={fiat}
                    initialValues={form.getFieldValue('exchanges')?.[index]}
                    exchangeName={form.getFieldValue('exchanges')?.[index]?.exchange_name}
                    onChange={values => handleExchangeChange(index, values)}
                    mode="edit"
                  />
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                    addExchange();
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Exchange
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Card>
  );

  return isEditing ? renderEditMode() : renderViewMode();
};

export default ExchangeSoupForm; 