# Multi-stage build for production
FROM node:18-alpine AS base

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Stage 1: Build frontend
FROM base AS frontend-builder

# Copy package files
COPY package*.json ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY components.json ./
COPY jsconfig.json ./

# Copy scripts directory (needed for prebuild)
COPY scripts/ ./scripts/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy frontend source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build frontend
RUN npm run build

# Stage 2: Production image
FROM base AS production

# Copy server files first (to get server/package.json)
COPY server/ ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Go back to app root
WORKDIR /app

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server/server-pg.js"]

