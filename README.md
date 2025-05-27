# CRM System Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white) ![TypeORM](https://img.shields.io/badge/TypeORM-262627?logo=typeorm) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens) ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) ![Docker](https://img.shields.io/badge/Swagger-2496ED?logo=swagger&logoColor=white)

A robust CRM system backend built with NestJS, TypeORM, and Supabase PostgreSQL, featuring customer management, interaction tracking, and user authentication.

## Features

- **Customer Management**
  - CRUD operations for customer profiles
  - Track company associations and customer statuses
- **Interaction Tracking**
  - Log communications (emails, calls, meetings)
  - Add follow-up reminders
- **User Authentication**
  - JWT-based secure authentication
  - Role-based access control
- **Advanced Search**
  - Filter customers by company/status
  - Full-text search using TypeORM
- **REST API**
  - Well-structured endpoints
  - Validation and error handling

## Tech Stack

## Tech Stack

- ![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white) **Core Framework**
- ![TypeORM](https://img.shields.io/badge/TypeORM-262627?logo=typeorm) **ORM**
- ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) **Database**
- ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens) **Authentication**
- ![class-validator](https://img.shields.io/badge/class--validator-4D4D4D?logo=npm) **Validation**
- ![dotenv](https://img.shields.io/badge/dotenv-ECD53F?logo=dotenv&logoColor=000) **Environment Management**

## Installation

```bash
# Clone repository
git clone https://github.com/devalentineomonya/CRM-Backend-NestJs-Ts-PostgresSQL-Docker-Supabase.git

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
```

## Configuration

Configure your `.env` file:

```ini
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
DATABASE_URL=postgresql://user:password@host:port/db_name

# Application Settings
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=3600s
```

## Database Setup

1. Create Supabase project
2. Run migrations:

```bash
pnpm run typeorm:run
```

3. Seed initial data (optional):

```bash
pnpm run seed
```

## Running the Application

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## API Documentation

Access endpoints via `http://localhost:3000/api`

- **Authentication**:

  - `POST /auth/login`
  - `POST /auth/register`

- **Customers**:

  - `GET /customers`
  - `POST /customers`
  - `GET /customers/search?query=`

- **Interactions**:
  - `POST /customers/:id/interactions`
  - `GET /interactions`

Test using Postman or Swagger UI (if configured)

## Future Improvements

- [ ] Docker containerization
- [ ] Redis integration for caching
- [ ] Rate limiting
- [ ] Enhanced search with ElasticSearch
- [ ] Comprehensive test suite
- [ ] Webhook support
- [ ] Advanced analytics endpoints

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Submit PR with detailed description

## License

MIT License - see [LICENSE](LICENSE) file
