# Use the official Node.js 18 image based on Alpine Linux
FROM node:18-alpine

# Create and set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 8080 to the host
EXPOSE 8080

# Start the application
CMD ["npm", "run", "build"]