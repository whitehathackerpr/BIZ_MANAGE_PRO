import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  Tag,
  message,
  Modal,
  Form,
  InputNumber,
  Typography,
  Tooltip
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  MinusOutlined,
  WarningOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { inventoryService } from '../../services/inventoryService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  min_quantity: number;
  price: number;
  category: string;
  last_updated: string;
}

const InventoryList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [categories, setCategories] = useState<string[]>([]);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getStockLevels({
        search: searchText,
        category: selectedCategory
      });
      setInventory(data);
    } catch (error) {
      message.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await inventoryService.getCategories();
      setCategories(data);
    } catch (error) {
      message.error('Failed to fetch categories');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchInventory();
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    fetchInventory();
  };

  const showAdjustModal = (record: InventoryItem) => {
    setSelectedItem(record);
    setAdjustModalVisible(true);
    form.resetFields();
  };

  const handleAdjustSubmit = async () => {
    try {
      const values = await form.validateFields();
      await inventoryService.adjustInventory(selectedItem!.product_id, {
        quantity: values.quantity,
        notes: values.notes,
        transaction_type: values.type
      });
      message.success('Inventory adjusted successfully');
      setAdjustModalVisible(false);
      fetchInventory();
    } catch (error) {
      message.error('Failed to adjust inventory');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a: InventoryItem, b: InventoryItem) =>
        a.product_name.localeCompare(b.product_name),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({ text: cat, value: cat })),
      onFilter: (value: string, record: InventoryItem) =>
        record.category === value,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: InventoryItem, b: InventoryItem) => a.quantity - b.quantity,
      render: (quantity: number, record: InventoryItem) => (
        <Space>
          {quantity}
          {quantity <= record.min_quantity && (
            <Tooltip title="Low stock">
              <WarningOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Min Quantity',
      dataIndex: 'min_quantity',
      key: 'min_quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price),
      sorter: (a: InventoryItem, b: InventoryItem) => a.price - b.price,
    },
    {
      title: 'Last Updated',
      dataIndex: 'last_updated',
      key: 'last_updated',
      render: (date: string) => formatDate(date),
      sorter: (a: InventoryItem, b: InventoryItem) =>
        new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: InventoryItem) => (
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showAdjustModal(record)}
          >
            Adjust
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search products"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={e => handleSearch(e.target.value)}
            />
            <Select
              placeholder="Filter by category"
              style={{ width: 200 }}
              allowClear
              onChange={handleCategoryChange}
            >
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchInventory}
            >
              Refresh
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={inventory}
            rowKey="id"
            loading={loading}
          />
        </Space>
      </Card>

      <Modal
        title="Adjust Inventory"
        visible={adjustModalVisible}
        onOk={handleAdjustSubmit}
        onCancel={() => setAdjustModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Adjustment Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="in">Stock In</Option>
              <Option value="out">Stock Out</Option>
              <Option value="adjustment">Adjustment</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryList; 