# syntax=docker/dockerfile:1

ARG BUN_VERSION=1.2.18

################################################################################
# Use Bun image for base image for all stages.
FROM oven/bun:${BUN_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app

################################################################################
# Create a stage for installing production dependencies.
FROM base as deps

# Copy package files
COPY package.json bun.lockb* ./

# Install production dependencies
RUN bun install --frozen-lockfile --production

################################################################################
# Create a stage for building the application.
FROM base as build

# Copy package files
COPY package.json bun.lockb* ./

# Install all dependencies (including devDependencies)
RUN bun install --frozen-lockfile

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN bun run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER bun

# Copy package.json and bun.lockb
COPY --chown=bun:bun package.json bun.lockb* ./

# Copy the production dependencies from the deps stage
COPY --from=deps --chown=bun:bun /usr/src/app/node_modules ./node_modules

# Copy the built Next.js application from the build stage
COPY --from=build --chown=bun:bun /usr/src/app/.next ./.next
COPY --from=build --chown=bun:bun /usr/src/app/public ./public

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["bun", "run", "start"]
