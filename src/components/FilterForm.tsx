import React from 'react';
import { Form, InputNumber, Space, Typography } from 'antd';
import { Filter } from '../services/api';

const { Text } = Typography;

interface FilterFormProps {
  initialValues?: Filter;
  onChange?: (values: Filter) => void;
  mode?: 'view' | 'edit';
}

const FilterForm: React.FC<FilterFormProps> = ({
  initialValues,
  onChange,
  mode = 'edit'
}) => {
  const [form] = Form.useForm();

  const handleValuesChange = (_: any, allValues: Filter) => {
    onChange?.(allValues);
  };

  const renderViewMode = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <Text strong>Min Amount:</Text> {initialValues?.min_amount}
      </div>
      <div>
        <Text strong>Max Amount:</Text> {initialValues?.max_amount}
      </div>
      <div>
        <Text strong>Min Price:</Text> {initialValues?.min_price}
      </div>
      <div>
        <Text strong>Max Price:</Text> {initialValues?.max_price}
      </div>
      <div>
        <Text strong>Payment Methods:</Text> {initialValues?.payment_methods.join(', ')}
      </div>
    </Space>
  );

  const renderEditMode = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label="Min Amount"
        name="min_amount"
        rules={[{ required: true, message: 'Please input min amount!' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>

      <Form.Item
        label="Max Amount"
        name="max_amount"
        rules={[{ required: true, message: 'Please input max amount!' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>

      <Form.Item
        label="Min Price"
        name="min_price"
        rules={[{ required: true, message: 'Please input min price!' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>

      <Form.Item
        label="Max Price"
        name="max_price"
        rules={[{ required: true, message: 'Please input max price!' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>

    
    </Form>
  );

  return mode === 'view' ? renderViewMode() : renderEditMode();
};

export default FilterForm; 