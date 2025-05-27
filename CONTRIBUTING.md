# Contribution Guidelines

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-blue.svg)

We welcome contributions to our CRM System Backend! Please follow these guidelines to ensure smooth collaboration.

## Getting Started

### Prerequisites
- Node.js 20+
- npm 8+
- Docker (optional, for future containerization)
- Supabase account

### Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/devalentineomonya/CRM-Backend-NestJs-Ts-PostgresSQL-Docker-Supabase.git
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Set up environment variables (copy `.env.example` to `.env`)
5. Configure your Supabase database

## Development Workflow

### Branch Naming
Use descriptive branch names:
- `feature/your-feature-name`
- `fix/issue-description`
- `docs/documentation-update`

```bash
git checkout -b feature/awesome-new-feature
```

### Code Guidelines
- Follow [NestJS best practices](https://docs.nestjs.com/)
- Use TypeORM patterns for database interactions
- Validate all DTOs with `class-validator`
- Handle errors using NestJS exception filters
- Keep test coverage in mind (future implementation)

### Linting
We use ESLint and Prettier:
```bash
npm run lint   # Check code quality
npm run format # Auto-format code
```

## Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:
```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Example:
```
feat(customers): add advanced search endpoint

- Implement full-text search using TypeORM
- Add query parameter validation
```

## Pull Requests
1. Ensure your branch is updated with `main`
2. Run tests (when available):
   ```bash
   pnpm test
   ```
3. Open PR against the `main` branch
4. Include:
   - Description of changes
   - Related issues
   - Screenshots (if applicable)
   - Migration steps (if database changes)

### PR Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Linter passes
- [ ] No console.log statements
- [ ] Follows security best practices

## Code Review Process
- Maintainers will review within 48 hours
- Be prepared to:
  - Explain implementation decisions
  - Make necessary changes
  - Add test coverage
- Use GitHub suggestions for small fixes

## Testing
![Test Coverage](https://img.shields.io/badge/Test_Coverage-0%25-red) *Coming Soon*

While we work on implementing comprehensive tests:
1. Manual test all endpoint changes
2. Verify database migrations
3. Check authentication flows
4. Validate error responses

## Documentation
Help us maintain great documentation:
- Update README for new features
- Add JSDoc comments for complex logic
- Keep API endpoints documented in Swagger
- Record architectural decisions in ADRs

## Community
![Discussions](https://img.shields.io/badge/Discussions-Open-blue)

- Join our [GitHub Discussions](https://github.com/devalentineomonya/CRM-Backend-NestJs-Ts-PostgresSQL-Docker-Supabase/discussions)
- Report bugs via [GitHub Issues](https://github.com/devalentineomonya/CRM-Backend-NestJs-Ts-PostgresSQL-Docker-Supabase/issues)
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
