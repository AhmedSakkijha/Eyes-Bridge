# Build stage
#FROM node:18-alpine AS builder
FROM node:20.11-alpine3.19 AS builder
WORKDIR /app

# Add environment variable to invalidate cache
ARG CACHEBUST=1

# Use pnpm as package manager
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm run build

# Check build file structure
RUN ls -la /app/.next

# If standalone directory doesn't exist, show error and stop
RUN if [ ! -d "/app/.next/standalone" ]; then echo ".next/standalone directory not found" && exit 1; fi

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]

# make sure to check the high vulnerabilities in the images 