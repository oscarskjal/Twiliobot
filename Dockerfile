# Use the official Node.js 22 LTS image as base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
# Using npm ci for faster, reliable, reproducible builds
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
  adduser -S twiliobot -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R twiliobot:nodejs /app

# Switch to the non-root user
USER twiliobot

# Expose the port the app runs on
EXPOSE 10000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Define the command to run the application
CMD ["npm", "start"]