# syntax=docker/dockerfile:1.7

# =============================================================================
# Stage 1 — deps: install production+dev dependencies (cached layer)
# =============================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copy lockfiles first to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# =============================================================================
# Stage 2 — builder: compile the Next.js app
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# =============================================================================
# Stage 3 — runner: minimal production image
# =============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Pull only the standalone server output + static assets + public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# public/ is optional — copy if it exists at build time
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Standalone server entrypoint
CMD ["node", "server.js"]
