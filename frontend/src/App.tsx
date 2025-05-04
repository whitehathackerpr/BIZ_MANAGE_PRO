import React from 'react';
import { Provider } from 'react-redux';
import { store } from './app';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </Provider>
  );
};

export default App;