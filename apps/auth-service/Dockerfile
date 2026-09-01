FROM node:18-alpine AS base
RUN apk add --no-cache openssl && ln -sf /usr/lib/libssl.so.3 /usr/lib/libssl.so.1.1 && ln -sf /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so.1.1
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /workspace

FROM base AS dependencies
COPY package.json pnpm-workspace.yaml ./
COPY packages/typescript-config ./packages/typescript-config
COPY packages/database ./packages/database
COPY packages/ui-components ./packages/ui-components
COPY packages/auth-client ./packages/auth-client
COPY apps/auth-service ./apps/auth-service
RUN pnpm install --filter @startupjigawa/auth-service... --prefer-offline --frozen-lockfile=false

FROM dependencies AS build
WORKDIR /workspace
RUN pnpm --filter @startupjigawa/database generate
RUN pnpm --dir packages/auth-client build
RUN pnpm --dir apps/auth-service build

FROM node:18-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /workspace
ENV NODE_ENV=production
COPY --from=dependencies /workspace/package.json ./package.json
COPY --from=dependencies /workspace/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=dependencies /workspace/apps/auth-service/package.json ./apps/auth-service/package.json
COPY --from=build /workspace/packages /workspace/packages
COPY --from=build /workspace/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=build /workspace/packages/auth-client/dist ./packages/auth-client/dist
COPY --from=dependencies /workspace/node_modules ./node_modules
COPY --from=dependencies /workspace/apps/auth-service/node_modules ./apps/auth-service/node_modules
EXPOSE 4000
CMD ["node", "apps/auth-service/dist/index.js"]
