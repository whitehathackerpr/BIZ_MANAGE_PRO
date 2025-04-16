# BIZ MANAGE PRO - Frontend

This is the frontend application for BIZ MANAGE PRO, a comprehensive business management platform.

## Features

- Complete authentication system
- User profile management
- Dashboard for business metrics
- Admin interface for system management
- Responsive design for all devices

## Tech Stack

- React 18+
- TypeScript
- React Router 6
- Axios for API requests
- CSS for styling

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
```bash
cd frontend
```

3. Install dependencies
```bash
npm install
# or
yarn install
```

4. Create a `.env` file based on `.env.example`
```bash
cp .env.example .env
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # Shared components
│   │   └── profile/     # User profile components
│   ├── contexts/        # React context providers
│   ├── layouts/         # Page layout components
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Dashboard pages
│   │   └── profile/     # Profile pages
│   ├── routes/          # Routing configuration
│   ├── services/        # API services
│   ├── styles/          # CSS styles
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main App component
│   └── index.tsx        # Application entry point
├── .env.example         # Example environment variables
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## Authentication Flow

The application implements a complete JWT-based authentication system:

1. User logs in with email/password
2. Backend returns access token and refresh token
3. Access token is used for API requests
4. Refresh token is used to obtain a new access token when needed
5. Protected routes redirect unauthenticated users to login

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000/api |
| VITE_APP_NAME | Application name | BIZ MANAGE PRO |
| VITE_APP_VERSION | Application version | 1.0.0 |
| VITE_ENABLE_AUTH_PERSISTENCE | Enable auth persistence in localStorage | true |
| VITE_ENABLE_DARK_MODE | Enable dark mode | false |

## License

This project is licensed under the MIT License.
