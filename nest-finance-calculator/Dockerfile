FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    python3-dev \
    py3-pip \
    py3-setuptools \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    build-base \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY web/package*.json ./web/
COPY web/frontend/package*.json ./web/frontend/

# Install dependencies
RUN PYTHON=/usr/bin/python3 npm install --build-from-source
RUN cd web && npm install
RUN cd web/frontend && npm install

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Environment variables
ENV PORT=5714
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Create a health check endpoint
RUN echo 'app.get("/health", (_, res) => res.status(200).send("OK"));' >> web/index.js

# Expose the port
EXPOSE 5714

# Start the app
CMD ["node", "web/index.js"]
