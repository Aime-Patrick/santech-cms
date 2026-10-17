# =============================================================================
# Strapi 5 Production Multi-Stage Dockerfile
# =============================================================================

# --- Stage 1: Build Stage ---
FROM node:20-alpine AS build

# Install build tools required for native dependencies
RUN apk update && apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    vips-dev \
    git \
    python3 \
    make \
    g++

WORKDIR /opt/app

# Copy dependency definitions
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
ENV NODE_ENV=development
RUN npm ci

# Copy application source code
COPY . .

# Set production environment and build the admin panel + TypeScript
ENV NODE_ENV=production
RUN npm run build

# Remove development dependencies to keep production light
RUN npm prune --production

# --- Stage 2: Production Runner ---
FROM node:20-alpine

# Install runtime dependencies only
RUN apk add --no-cache \
    vips-dev \
    curl

WORKDIR /opt/app

# Set production environment
ENV NODE_ENV=production

# Copy built artifacts and production node_modules from build stage
COPY --from=build /opt/app/package.json ./package.json
COPY --from=build /opt/app/node_modules ./node_modules
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/.strapi ./.strapi
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/database ./database
COPY --from=build /opt/app/favicon.png ./favicon.png

# Create a non-root user for security
RUN addgroup -g 1001 -S strapi && \
    adduser -u 1001 -S strapi -G strapi && \
    chown -R strapi:strapi /opt/app

USER strapi

EXPOSE 1337

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:1337/_health || exit 1

CMD ["npm", "run", "start"]
