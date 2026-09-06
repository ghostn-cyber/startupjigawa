FROM node:18-alpine

RUN apk add --no-cache openssl && ln -sf /usr/lib/libssl.so.3 /usr/lib/libssl.so.1.1 && ln -sf /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so.1.1

WORKDIR /workspace
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps ./apps
COPY packages/app-server ./packages/app-server

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate \
    && pnpm install --no-frozen-lockfile

ARG APP_KIND=static
ARG PORT=8080
ENV APP_KIND=$APP_KIND PORT=$PORT NODE_ENV=production

CMD ["node", "packages/app-server/src/index.js"]