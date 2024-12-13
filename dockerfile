# Base image for Node.js
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create a temporary folder in the root directory
RUN mkdir -p /temp

# Expose the port your app runs on
EXPOSE 6789

# Install Redis using the package manager
RUN apt-get update && \
    apt-get install -y redis-server && \
    rm -rf /var/lib/apt/lists/*


RUN npx prisma generate

# Command to start Redis and the Node.js app
CMD ["sh", "-c", "redis-server --daemonize yes && npm start"]