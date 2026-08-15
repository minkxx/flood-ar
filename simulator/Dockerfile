FROM node:22-slim AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter shared build
RUN pnpm --filter simulator build
RUN pnpm --filter simulator deploy --prod /app

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app .
CMD ["node", "dist/simulate.js"]
