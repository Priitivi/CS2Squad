# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
