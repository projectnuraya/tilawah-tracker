# Production Runner Image
FROM node:20-alpine AS runner
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build from host
# Ensure 'npm run build' has been executed on the host first
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
