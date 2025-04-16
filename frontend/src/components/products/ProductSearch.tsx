import React, { useState, useCallback } from 'react';
import {
  Input,
  Select,
  Space,
  Card,
  Button,
  Form,
  DatePicker,
  InputNumber,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import { productService } from '../../services/productService';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProductSearchProps {
  onSearch: (params: any) => void;
  loading?: boolean;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = async (values: any) => {
    const searchParams = {
      ...values,
      dateRange: values.dateRange ? {
        start: values.dateRange[0].toISOString(),
        end: values.dateRange[1].toISOString()
      } : undefined
    };
    onSearch(searchParams);
  };

  const debouncedSearch = useCallback(
    debounce((values) => handleSearch(values), 500),
    []
  );

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Card>
      <Form
        form={form}
        onValuesChange={(_, values) => debouncedSearch(values)}
        layout="vertical"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Basic Search */}
          <Space style={{ width: '100%' }}>
            <Form.Item
              name="searchTerm"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input
                placeholder="Search by name, SKU, or description"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
            <Button
              type="link"
              onClick={() => setShowAdvanced(!showAdvanced)}
              icon={<FilterOutlined />}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </Space>

          {/* Advanced Search */}
          {showAdvanced && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Space wrap style={{ width: '100%' }}>
                <Form.Item name="category" style={{ minWidth: 200 }}>
                  <Select placeholder="Category">
                    <Option value="electronics">Electronics</Option>
                    <Option value="clothing">Clothing</Option>
                    <Option value="food">Food</Option>
                    {/* Add more categories as needed */}
                  </Select>
                </Form.Item>

                <Form.Item name="status">
                  <Select placeholder="Status" style={{ minWidth: 150 }}>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="discontinued">Discontinued</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="priceRange">
                  <Space>
                    <InputNumber
                      placeholder="Min Price"
                      style={{ width: 120 }}
                    />
                    <span>-</span>
                    <InputNumber
                      placeholder="Max Price"
                      style={{ width: 120 }}
                    />
                  </Space>
                </Form.Item>

                <Form.Item name="stockLevel">
                  <Select placeholder="Stock Level" style={{ minWidth: 150 }}>
                    <Option value="in_stock">In Stock</Option>
                    <Option value="low_stock">Low Stock</Option>
                    <Option value="out_of_stock">Out of Stock</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="dateRange">
                  <RangePicker
                    placeholder={['Start Date', 'End Date']}
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => form.submit()}
                      icon={<SearchOutlined />}
                      loading={loading}
                    >
                      Search
                    </Button>
                    <Button
                      onClick={handleReset}
                      icon={<ClearOutlined />}
                    >
                      Reset
                    </Button>
                  </Space>
                </Form.Item>
              </Space>
            </>
          )}
        </Space>
      </Form>
    </Card>
  );
};

export default ProductSearch; 