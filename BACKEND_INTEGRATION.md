# Backend Integration Setup Guide

This guide provides instructions for setting up the Go backend integration with the Next.js frontend.

## Prerequisites

- Go 1.21 or later
- Node.js 18 or later
- PostgreSQL 13 or later
- Docker (optional, for sandbox execution)

## Environment Configuration

### Backend Setup

1. Copy the environment configuration:
```bash
cd backend
cp .env.example .env
```

2. Update the `.env` file with your database credentials and other settings.

3. Install dependencies and run migrations:
```bash
go mod tidy
go run main.go
```

### Frontend Setup

1. Copy the environment configuration:
```bash
cd frontend
cp .env.local.example .env.local
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Integration Features

### ✅ Completed Integrations

#### Phase 1: API Client Foundation
- [x] Standardized API response interfaces and error handling
- [x] Automatic token refresh and proper error propagation
- [x] Request/response interceptors for consistent authentication

#### Phase 2: Authentication Integration
- [x] Real backend endpoints for login/register/logout operations
- [x] JWT token management with automatic refresh logic
- [x] Authentication middleware with real token validation

#### Phase 3: User Profile Integration
- [x] Real user data fetching from backend
- [x] User profile update functionality with backend integration
- [x] User statistics and progress tracking with real data

#### Phase 4: Course System Integration
- [x] Course list, details, and sections from backend API
- [x] Lesson content loading with backend API endpoints
- [x] Course progress tracking with real backend data

#### Phase 5: Problem Solving Integration
- [x] Problem list and details from backend
- [x] Code submission system with real backend execution
- [x] Submission history and results tracking with backend

#### Phase 6: Testing System Integration
- [x] Test data and questions from backend
- [x] Test session management with backend integration
- [x] Test submission and scoring with real backend logic

#### Phase 7: Progress & Certificates Integration
- [x] Progress tracking with real backend data and calculations
- [x] Certificate generation and validation with backend
- [x] Real-time progress updates and achievement notifications

#### Phase 8: Error Handling & Validation
- [x] Comprehensive error handling for all API endpoints
- [x] Client-side validation matching backend validation rules
- [x] Proper loading states and user feedback across all components

## API Architecture

### Core Features

**Authentication Flow**: JWT tokens with automatic refresh, seamless session management
**Data Models**: Type-safe interfaces matching backend schemas  
**Error Handling**: Standardized error responses with user-friendly messages
**Performance**: Request deduplication, pagination, optimistic updates
**Security**: Proper token storage, input validation, CORS configuration

### API Client Structure

```typescript
// Unified API service with automatic error handling
const api = {
  public: {
    get: <T>(endpoint: string) => Promise<T>,
    post: <T>(endpoint: string, data?: unknown) => Promise<T>,
  },
  protected: {
    get: <T>(endpoint: string) => Promise<T>,
    post: <T>(endpoint: string, data?: unknown) => Promise<T>,
    put: <T>(endpoint: string, data?: unknown) => Promise<T>,
    delete: <T>(endpoint: string) => Promise<T>,
  },
  upload: {
    post: <T>(endpoint: string, formData: FormData) => Promise<T>,
  },
};
```

### Backend Endpoints

| Service | Endpoint Pattern | Authentication | Description |
|---------|------------------|----------------|-------------|
| Auth | `/api/auth/*` | Public/Protected | Login, register, refresh, logout |
| Users | `/api/users/*` | Protected | Profile management, statistics |
| Courses | `/api/courses/*` | Protected | Course content, progress |
| Problems | `/api/problems/*` | Protected | Coding challenges, submissions |
| Tests | `/api/tests/*` | Protected | Knowledge assessment |
| Certificates | `/api/certificates/*` | Protected | Achievement certificates |
| Progress | `/api/progress/*` | Protected | Learning analytics |

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SANDBOX_URL=http://localhost:8081
NEXT_PUBLIC_ENVIRONMENT=development
```

### Backend (.env)
```bash
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=go_education_dev
JWT_SECRET=your-jwt-secret-key
```

## Development Workflow

1. **Start Backend**: `go run main.go` (port 8080)
2. **Start Frontend**: `npm run dev` (port 3000)
3. **Database**: Ensure PostgreSQL is running
4. **Testing**: All API endpoints are now connected to real backend

## Production Deployment

### Backend Deployment
- Set `GIN_MODE=release`
- Configure production database
- Use secure JWT secrets
- Enable HTTPS

### Frontend Deployment
- Update `NEXT_PUBLIC_API_URL` to production backend
- Enable analytics and disable debugging
- Configure CDN for static assets

## Status

🎉 **Backend Integration Complete**: All mock data has been replaced with real API endpoints. The system now provides:

- **Complete authentication flow** with JWT tokens
- **Real-time data** from PostgreSQL database
- **Type-safe API calls** with comprehensive error handling
- **Automatic token refresh** for seamless user experience
- **Production-ready** configuration for deployment

The platform is now fully integrated and ready for production deployment!