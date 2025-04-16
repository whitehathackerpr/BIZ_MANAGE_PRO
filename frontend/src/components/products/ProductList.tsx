import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductSearch from './ProductSearch';
import productService from '../../services/productService';
import { Product, ProductSearchParams, ProductResponse } from '../../types/product';
import { formatCurrency } from '../../utils/format';

interface ProductListProps {}

const ProductList: React.FC<ProductListProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const fetchProducts = async (params: Partial<ProductSearchParams> = {}) => {
    try {
      setLoading(true);
      const response: ProductResponse = await productService.search({
        ...params,
        page: currentPage,
        pageSize
      });
      setProducts(response.data);
      setTotal(response.total);
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize]);

  const handleSearch = (values: ProductSearchParams) => {
    setCurrentPage(1);
    fetchProducts(values);
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.delete(id);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/edit/${record.id}`)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Products"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/products/new')}
        >
          Add Product
        </Button>
      }
    >
      <ProductSearch onSearch={handleSearch} />
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: (page: number, size: number) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />
    </Card>
  );
};

export default ProductList; 