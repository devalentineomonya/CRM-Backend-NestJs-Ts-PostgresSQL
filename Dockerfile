ARG NODE_VERSION=22.15.0
ARG PNPM_VERSION=10.11.0

FROM node:${NODE_VERSION}-alpine AS base

# Create non-root user with dedicated group
RUN addgroup -S nodejs && adduser -S nestJs -G nodejs

WORKDIR /usr/src/app

# Install pnpm with cache
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

# Copy only dependency files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies with separate production stage
FROM base AS deps
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Build stage
FROM base AS build
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Final image
FROM base AS final
ENV NODE_ENV=production

# Copy production dependencies and build output
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY package.json .

# Set ownership and permissions
RUN chown -R nestJs:nodejs . && \
    chmod -R 755 . && \
    chmod g+s .

USER nestJs
EXPOSE 3000
CMD ["pnpm", "start"]
