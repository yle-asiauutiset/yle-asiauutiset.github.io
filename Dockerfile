# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
# COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
# COPY frontend/package.json frontend/package-lock.json* frontend/yarn.lock* frontend/pnpm-lock.yaml* ./frontend/

# Copy the entire frontend application
COPY . .

# Install dependencies
RUN npm ci

# Build shared
RUN npm run build -w shared

# Build the application
RUN npm run build -w frontend

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
COPY frontend/package.json frontend/package-lock.json* frontend/yarn.lock* frontend/pnpm-lock.yaml* ./frontend/
COPY shared/package.json shared/package-lock.json* shared/yarn.lock* shared/pnpm-lock.yaml* ./shared/

# Install only production dependencies
# RUN npm ci --only=production
RUN npm ci

# Copy built application from builder stage
COPY --from=builder /app/frontend/.svelte-kit ./frontend/.svelte-kit

# Expose port 3000
EXPOSE 4173

# Start the application
CMD ["npm", "run", "preview", "--workspace=frontend", "--", "--host"]
