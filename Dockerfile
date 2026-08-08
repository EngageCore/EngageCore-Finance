# Static production build served by nginx. pnpm workspace (SoybeanAdmin base).
# Node 20.19 and pnpm 10 are what package.json "engines" requires.
FROM node:20.19-alpine AS build

WORKDIR /app

# Installing pnpm via npm rather than corepack: the corepack bundled with these
# Node images ships stale signing keys and fails to verify pnpm's release.
RUN npm install -g pnpm@10

# Workspace manifests first so the install layer caches independently of source.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages ./packages
RUN pnpm install --frozen-lockfile

COPY . .

# Builds with --mode prod, which reads .env.prod (VITE_API_URL=/api,
# VITE_SERVICE_BASE_URL=/api -- both same-origin, proxied by nginx).
RUN pnpm build

FROM nginx:1.27-alpine
# vite.config.js sets outDir to path.resolve(__dirname, "../server/public/dist"),
# so with WORKDIR /app the bundle lands at /server/public/dist -- not /app/dist.
COPY --from=build /server/public/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
