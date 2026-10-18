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

# Build: compiles TypeScript to dist/ then builds the Strapi admin panel
ENV NODE_ENV=production
RUN npm run build

# Fail the image build if the Admin shell and custom schemas were not generated.
RUN test -f /opt/app/dist/build/index.html && \
    test -f /opt/app/dist/src/api/certificate/content-types/certificate/schema.json

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

# Create the runtime user before copying files so ownership is applied during COPY.
RUN addgroup -g 1001 -S strapi && \
    adduser -u 1001 -S strapi -G strapi

# Copy the Admin build, production dependencies, and compiled runtime application.
# Strapi production must load the compiled API tree from dist/src. Copying both
# dist/src and the root src tree can register duplicate or malformed routes.
COPY --chown=strapi:strapi --from=build /opt/app/package.json ./package.json
COPY --chown=strapi:strapi --from=build /opt/app/node_modules ./node_modules
COPY --chown=strapi:strapi --from=build /opt/app/dist/build ./dist/build
# Strapi's Admin server uses this fallback when the project dist path is not resolved.
COPY --chown=strapi:strapi --from=build /opt/app/dist/build ./node_modules/@strapi/admin/dist/server/server/build
COPY --chown=strapi:strapi --from=build /opt/app/.strapi ./.strapi
COPY --chown=strapi:strapi --from=build /opt/app/dist/config ./config
COPY --chown=strapi:strapi --from=build /opt/app/dist/src ./dist/src
# Keep maintenance and catalogue seed commands available in the production container.
COPY --chown=strapi:strapi --from=build /opt/app/scripts ./scripts
COPY --chown=strapi:strapi --from=build /opt/app/public ./public
COPY --chown=strapi:strapi --from=build /opt/app/database ./database
COPY --chown=strapi:strapi --from=build /opt/app/favicon.png ./favicon.png

USER strapi

EXPOSE 1337

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:1337/_health || exit 1

CMD ["npm", "run", "start"]
