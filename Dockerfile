FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Run migrations, seed, and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && npm run start"]