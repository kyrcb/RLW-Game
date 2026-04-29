# Stage 1: Build the React client
FROM node:20-alpine AS builder
WORKDIR /build
COPY client/package*.json ./client/
RUN npm install --prefix client
COPY client/ ./client/
RUN npm run build --prefix client

# Stage 2: Run the server with the built client included
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev
COPY server/ ./server/
COPY --from=builder /build/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/index.js"]
