# Use an official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
# (if you're building a Node.js/React app, ensure these files exist in your project)
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that your app runs on (e.g., 3000 for React)
EXPOSE 3000

# Default command to start the application
CMD ["npm", "start"]

