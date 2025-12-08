# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache coreutils

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
# RUN npm run build -w backend
CMD ["npm", "run", "start:backend"]

# # Production stage
# FROM node:20-alpine

# WORKDIR /app

# # Copy package files
# COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
# COPY backend/package.json backend/package-lock.json* backend/yarn.lock* backend/pnpm-lock.yaml* ./backend/
# COPY shared/package.json shared/package-lock.json* shared/yarn.lock* shared/pnpm-lock.yaml* ./shared/

# # Install only production dependencies
# # RUN npm ci --only=production
# RUN npm ci

# # Copy built application from builder stage
# COPY --from=builder /app/backend/dist ./backend/dist

# # Expose port 3000
# EXPOSE 4173

# # Start the application
# CMD ["npm", "run", "preview", "--workspace=frontend", "--", "--host"]
