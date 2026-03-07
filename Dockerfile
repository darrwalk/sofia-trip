FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
RUN mkdir -p /app/data

EXPOSE 3000
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
CMD ["node", "server.js"]
