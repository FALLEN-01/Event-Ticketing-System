# Build stage
FROM node:20-alpine3.21 AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL=http://localhost:8000

# Set environment variable for build
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app (Vite will use VITE_API_URL)
RUN npm run build

# Production stage
FROM nginx:alpine3.21

# Security: Fix critical vulnerabilities
# - libxml2: CVE-2025-XXXXX (CVSS 9.1) - Critical
# - libpng: Multiple CVEs (CVSS 7.1, 6.1) - High/Medium
# - libavif: CVE-2025-48175, CVE-2025-48174 (CVSS 4.5) - Medium
# - curl: CVE-2025-10966 (CVSS 4.3) - Medium
RUN apk upgrade --no-cache --available libxml2 libpng libavif curl

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
