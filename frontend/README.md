# Business Management Pro - Frontend

This is the frontend application for the Business Management Pro system, built with React, TypeScript, and Vite.

## Features

- Modern UI with Tailwind CSS
- Type-safe development with TypeScript
- State management with React Query
- Form handling with React Hook Form
- Real-time notifications with WebSocket
- Authentication and authorization
- Responsive design
- Dark mode support

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Build for production:

```bash
npm run build
# or
yarn build
```

4. Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
├── routes/         # Route definitions
├── services/       # API and WebSocket services
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## Development

- The application uses Vite for fast development and building
- ESLint and Prettier are configured for code quality
- TypeScript is used for type safety
- Tailwind CSS is used for styling
- React Query is used for data fetching and caching
- React Router is used for routing
- React Hot Toast is used for notifications

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
