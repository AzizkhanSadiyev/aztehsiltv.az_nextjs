# Stage 1: Builder - Build the application
FROM node:24 AS builder
WORKDIR /app

# Copy source files
COPY source/ ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Build with production environment (NEXT_PUBLIC_* vars need to be available at build time)
# Pass build-time environment variables via --build-arg if needed
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run build

# Stage 2: Production - Create the final image
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app

# Copy package.json and install only production dependencies
COPY --from=builder /app/package.json /app/package-lock.json ./

RUN npm install --omit=dev --legacy-peer-deps

# Copy the built application and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000
CMD ["npm", "start"]
