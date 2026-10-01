# --- Deps: install only, cached layer -------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build: compile TypeScript -> dist ------------------------------
FROM deps AS build
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# --- Runtime: minimal, non-root -------------------------------------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# main.js is the compiled entry point (nest build -> dist/main.js)
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
