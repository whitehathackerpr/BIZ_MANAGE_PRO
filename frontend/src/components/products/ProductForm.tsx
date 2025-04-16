import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, message } from 'antd';
import { Product, ProductCreate, ProductUpdate, ProductStatus, ProductCategory } from '../../types/api/responses/product';
import { productService } from '../../services/productService';

const { TextArea } = Input;
const { Option } = Select;

const ProductForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const product = await productService.getProduct(Number(id));
          form.setFieldsValue(product);
        } catch (error) {
          message.error('Failed to fetch product');
          navigate('/products');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, form, navigate, isEdit]);

  const onFinish = async (values: ProductCreate | ProductUpdate) => {
    try {
      setLoading(true);
      if (isEdit) {
        await productService.updateProduct(Number(id), values as ProductUpdate);
        message.success('Product updated successfully');
      } else {
        await productService.createProduct(values as ProductCreate);
        message.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Product' : 'Create Product'}
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="max-w-2xl"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input product name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="sku"
          label="SKU"
          rules={[{ required: true, message: 'Please input SKU!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: 'Please input price!' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            formatter={(value: number | undefined) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="cost"
          label="Cost"
          rules={[{ required: true, message: 'Please input cost!' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            formatter={(value: number | undefined) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
        >
          <Select>
            {Object.values(ProductStatus).map(status => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select category!' }]}
        >
          <Select>
            {Object.values(ProductCategory).map(category => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, message: 'Please input quantity!' }]}
        >
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item
          name="min_quantity"
          label="Minimum Quantity"
          rules={[{ required: true, message: 'Please input minimum quantity!' }]}
        >
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item
          name="max_quantity"
          label="Maximum Quantity"
          rules={[{ required: true, message: 'Please input maximum quantity!' }]}
        >
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item
          name="unit"
          label="Unit"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="barcode"
          label="Barcode"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="weight"
          label="Weight"
        >
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item
          name="dimensions"
          label="Dimensions"
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Button className="ml-4" onClick={() => navigate('/products')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductForm;