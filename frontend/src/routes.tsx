import { RouteObject } from 'react-router-dom';
import ProductList from './components/products/ProductList';
import ProductForm from './components/products/ProductForm';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <div>Home</div>,
  },
  {
    path: '/products',
    element: <ProductList />,
  },
  {
    path: '/products/new',
    element: <ProductForm />,
  },
  {
    path: '/products/:id',
    element: <ProductForm />,
  },
]; 