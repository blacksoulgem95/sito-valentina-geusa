# Use the official Node.js 20 image as base
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Install additional system dependencies for native modules (Sharp, etc.)
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    libvips-dev \
    python3 \
    make \
    g++ \
    openssh-client \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /workspace

# Switch to non-root user (already exists in base image)
USER node
