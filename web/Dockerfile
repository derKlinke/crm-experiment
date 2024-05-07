# Use the official Node.js 10 image.
FROM oven/bun:1 as base

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN bun install

# Copy the rest of your app's source code
COPY . .

ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Build your app
RUN bun run build

# Next.js listens on port 3000 by default
EXPOSE 3000

# Start the Next.js app
CMD ["bun", "start"]
