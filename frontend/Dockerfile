# Use the official Node.js 18 image based on Alpine Linux
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Use a minimal runtime image for the production environment
FROM node:18-alpine AS runner

# Set the working directory inside the container
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000 to the host (default for Next.js)
# EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
