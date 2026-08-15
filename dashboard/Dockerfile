FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter shared build
RUN pnpm --filter dashboard build

FROM nginx:alpine AS runtime
COPY --from=build /repo/dashboard/dist /usr/share/nginx/html
EXPOSE 80
