FROM node:24-bookworm-slim AS base

# Prisma's native engine requires OpenSSL in the build and runtime images.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
# npm ci runs the existing postinstall Prisma generation hook.
COPY prisma ./prisma
RUN npm ci
RUN npm exec -- prisma generate

FROM dependencies AS build
COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
# Keep the locked Prisma CLI and tsx dependencies for db:migrate and db:seed.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/server/src ./server/src
COPY --from=build --chown=node:node /app/tsconfig.json ./tsconfig.json

USER node
EXPOSE 3000
CMD ["npm", "start"]
