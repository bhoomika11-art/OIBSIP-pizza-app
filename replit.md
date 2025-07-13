# Pizza Ordering Application

## Overview

This is a full-stack pizza ordering application built with React, Express.js, and PostgreSQL. The application allows users to build custom pizzas by selecting ingredients, place orders, and track their status. It includes an admin panel for inventory management and order processing. The app uses Replit's authentication system for user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and building
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom pizza-themed color palette
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit's OpenID Connect authentication system
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with JSON responses

### Database Design
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: PostgreSQL table for user sessions

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Server-side sessions stored in PostgreSQL
- **User Storage**: Custom user table with profile information
- **Authorization**: Role-based access control (admin vs regular users)

### Pizza Builder
- **Ingredient Management**: Separate tables for bases, sauces, cheeses, and toppings
- **Inventory Tracking**: Stock levels and low-stock alerts
- **Price Calculation**: Dynamic pricing based on selected ingredients
- **Visual Preview**: Custom pizza visualization component

### Order Management
- **Order Lifecycle**: Four-stage process (received → kitchen → delivery → delivered)
- **Order Items**: Support for multiple pizzas per order
- **Topping Management**: Individual topping tracking per pizza
- **Payment Integration**: Mock payment processing system

### Admin Dashboard
- **Order Management**: View and update order statuses
- **Inventory Control**: Update stock levels and monitor low inventory
- **Analytics**: Order statistics and revenue tracking
- **User Management**: Admin role assignment

## Data Flow

### User Authentication Flow
1. User clicks "Sign In" → redirected to Replit OAuth
2. Successful authentication → user data stored/updated in database
3. Session created and stored in PostgreSQL
4. Frontend receives user data via `/api/auth/user` endpoint

### Pizza Building Flow
1. Load ingredients from database via multiple API endpoints
2. User selects ingredients → state managed in React component
3. Real-time price calculation based on ingredient selection
4. Pizza preview updates dynamically with visual representation

### Order Processing Flow
1. User submits order → validated on backend with Zod schemas
2. Order and order items saved to database
3. Mock payment processing simulation
4. Order status updates tracked through database
5. Real-time order tracking for users

### Inventory Management Flow
1. Admin updates stock levels via admin panel
2. Backend validates and updates inventory in database
3. Low stock alerts generated when items fall below threshold
4. Automatic stock deduction when orders are placed

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **Build Tools**: Vite, TypeScript, ESBuild for production builds
- **Database**: Drizzle ORM, Neon PostgreSQL, WebSocket support

### UI and Styling
- **Component Library**: Radix UI primitives (40+ components)
- **Design System**: shadcn/ui components
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React icons

### Backend Infrastructure
- **Authentication**: Replit's OpenID client, Passport.js strategy
- **Session Management**: Express session, connect-pg-simple
- **Database**: Neon serverless PostgreSQL driver
- **Validation**: Zod for runtime type checking

### Development Tools
- **Development**: Replit-specific plugins for cartographer and error overlay
- **Code Quality**: TypeScript strict mode, ES2022 features
- **Testing**: Development error boundaries and runtime error handling

## Deployment Strategy

### Development Environment
- **Platform**: Replit with integrated development tools
- **Hot Reload**: Vite HMR for frontend, nodemon-like behavior for backend
- **Database**: Neon PostgreSQL with development database URL
- **Authentication**: Replit Auth with development OAuth configuration

### Production Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit applies schema changes
4. **Static Assets**: Frontend assets served by Express in production

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable for PostgreSQL connection
- **Authentication**: Replit-provided OAuth configuration
- **Session Security**: `SESSION_SECRET` for session encryption
- **Domain Configuration**: `REPLIT_DOMAINS` for OAuth redirect validation

### Production Considerations
- **Asset Serving**: Express serves static files in production mode
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Security**: HTTPS-only cookies, secure session configuration
- **Performance**: Build optimization with Vite and ESBuild