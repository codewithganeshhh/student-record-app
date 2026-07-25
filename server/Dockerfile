# Use a lightweight Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package metadata first to leverage Docker build cache
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy remaining source code
COPY . .

# Expose port (Render sets PORT env variable, but we default to 5000)
EXPOSE 5000

# Start command
CMD ["node", "index.js"]
