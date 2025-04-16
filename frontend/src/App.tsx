import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import { DarkModeProvider } from './contexts/DarkModeContext';
import './styles/main.css';

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App; 