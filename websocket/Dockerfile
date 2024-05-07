# Use the official Node.js 10 image.
FROM oven/bun:1 as base

# Create and define the node_modules's cache directory.
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# If you are building your code for production
RUN bun install 

# Bundle app source
COPY . .

# Your app binds to port 3000
EXPOSE 3001

# Run the app using CMD
CMD [ "bun", "run", "server.js" ]
