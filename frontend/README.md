# BizManage Pro Frontend

A modern React frontend application for BizManage Pro, built with Vite and following best practices for scalability and maintainability.

## Features

- Modern React with Vite for fast development
- Responsive design with a 12-column grid system
- Authentication system with protected routes
- Reusable components with consistent styling
- API integration with Axios
- State management with React Context
- Custom hooks for data fetching
- Form handling with React Hook Form
- Type checking with PropTypes

## Tech Stack

- React 18
- Vite
- React Router DOM
- Axios
- React Query
- React Hook Form
- Material-UI
- CSS Variables for theming

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=BizManage Pro
VITE_APP_VERSION=1.0.0
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── api/                 # API configuration and services
│   ├── api.js          # Axios instance setup
│   ├── auth.js         # Authentication API
│   └── inventory.js    # Inventory API
├── assets/             # Static assets
│   ├── images/         # Image files
│   └── fonts/          # Custom fonts
├── components/         # Reusable components
│   ├── common/         # Generic components
│   ├── layout/         # Layout components
│   └── widgets/        # Feature-specific components
├── context/           # Global state management
│   └── AuthContext.jsx # Authentication context
├── hooks/             # Custom React hooks
│   └── useFetch.js    # Data fetching hook
├── pages/             # Page components
├── styles/            # Global styles
│   ├── global.css     # Global styles
│   └── variables.css  # CSS variables
└── App.jsx            # Main application component
```

## Design Guidelines

### Colors

- Primary Blue: #2F80ED
- Secondary Blue: #56CCF2
- Accent Orange: #F2994A
- Error Red: #EB5757
- Dark Text: #333333
- Medium Text: #4F4F4F
- Light Background: #FFFFFF
- Surface Gray: #F4F4F4
- Border Gray: #E0E0E0

### Typography

- Font Family: Roboto, sans-serif
- H1: 36px bold
- H2: 30px bold
- H3: 24px bold
- H4: 20px bold
- Body: 16px
- Small: 14px

### Spacing

- Base unit: 8px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## API Integration

The frontend communicates with the backend through the following main endpoints:

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout

### Inventory
- GET /api/inventory/products
- GET /api/inventory/products/:id
- POST /api/inventory/products
- PUT /api/inventory/products/:id
- DELETE /api/inventory/products/:id
- POST /api/inventory/adjust

## Development Guidelines

### Code Style

- Use functional components with hooks
- Follow the component structure:
  ```jsx
  import React from 'react';
  import PropTypes from 'prop-types';
  import './ComponentName.css';
  
  const ComponentName = ({ prop1, prop2 }) => {
    return (
      // Component JSX
    );
  };
  
  ComponentName.propTypes = {
    prop1: PropTypes.string.isRequired,
    prop2: PropTypes.number,
  };
  
  export default ComponentName;
  ```

### State Management

- Use React Context for global state
- Use local state for component-specific state
- Use custom hooks for reusable logic

### Performance

- Implement code splitting with React.lazy()
- Use React.memo() for expensive components
- Optimize images and assets
- Use proper caching strategies

## Testing

Run tests:
```bash
npm test
```

## Building for Production

Build the application:
```bash
npm run build
```

The build output will be in the `dist` directory.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
