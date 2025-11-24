# Petzilla Admin API

Enterprise-level backend framework built with Node.js + TypeScript + Koa3 + MySQL + Redis

## Features

- **Modern Stack**: Built with Node.js, TypeScript, and Koa 3
- **Database**: MySQL with connection pooling
- **Caching**: Redis for high-performance caching
- **Security**: Helmet for security headers, CORS configuration
- **Logging**: Winston for structured logging with daily rotation
- **Error Handling**: Centralized error handling middleware
- **Validation**: Built-in request validation utilities
- **API Structure**: RESTful API with clean architecture (Controller → Service → Model)
- **Hot Reload**: Nodemon for development auto-restart
- **Type Safety**: Full TypeScript support with strict mode

## Project Structure

```
apps/admin/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Main config
│   │   ├── database.ts  # MySQL connection
│   │   └── redis.ts     # Redis connection
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── middlewares/     # Custom middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript types
├── logs/                # Application logs
├── .env                 # Environment variables
├── .env.development     # Development environment
├── .env.production      # Production environment
├── database.sql         # Database schema
└── package.json         # Dependencies
```

## Prerequisites

- Node.js >= 18
- MySQL >= 8.0
- Redis >= 6.0
- pnpm (recommended) or npm

## Installation

1. Install dependencies:
```bash
cd apps/admin
pnpm install
```

2. Configure environment variables:
```bash
# Copy and edit .env file
cp .env.development .env
# Update database and Redis credentials
```

3. Initialize database:
```bash
# Import the database schema
mysql -u root -p < database.sql
```

4. Start Redis:
```bash
redis-server
```

## Development

```bash
# Start development server with hot reload
pnpm dev

# The server will start on http://localhost:3000
```

## Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Example Request

```bash
# Health check
curl http://localhost:3000/api/health

# Get users with pagination
curl http://localhost:3000/api/users?page=1&pageSize=10

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## API Response Format

All API responses follow this structure:

```typescript
{
  code: number;      // 0 for success, other for errors
  message: string;   // Response message
  data: any;         // Response data
  timestamp: number; // Unix timestamp
}
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Prettier

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| DB_HOST | MySQL host | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | - |
| DB_DATABASE | MySQL database | petzilla_dev |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password | - |
| CORS_ORIGIN | CORS origin | * |

## Architecture

### Three-Layer Architecture

1. **Controller Layer**: Handles HTTP requests and responses
2. **Service Layer**: Contains business logic
3. **Model Layer**: Defines data structures

### Middleware Pipeline

1. Security (Helmet)
2. CORS
3. Body Parser
4. Response Timing
5. Request Logger
6. Error Handler
7. Routes

## Best Practices

- Use TypeScript for type safety
- Follow RESTful API conventions
- Implement proper error handling
- Log important events
- Validate input data
- Use environment variables for configuration
- Keep controllers thin, services fat
- Write meaningful commit messages

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
