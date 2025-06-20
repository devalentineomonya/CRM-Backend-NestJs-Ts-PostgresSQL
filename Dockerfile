ARG NODE_VERSION=22.15.0
ARG PNPM_VERSION=10.11.0

# Use Node.js 20 Alpine as base image
FROM node:${NODE_VERSION}-alpine

RUN apk add --no-cache curl
# Install pnpm globally
RUN npm install -g pnpm@${PNPM_VERSION}

# Set working directory
WORKDIR /app

# Create applogs directory for logging
RUN mkdir -p /app/logs

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./


# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start the application in development mode
CMD ["pnpm", "run", "start:dev"]
