# Self-host delivery mode (docs/PLAN.md §6, docs/TODOS.md 5.9).
#
# Build:  docker build -t github-readme-stats .
# Run:    docker run -p 3000:3000 -e GITHUB_TOKEN=ghp_xxx github-readme-stats
# Restrict who it serves: add -e WHITELIST=your-username,another-user

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# next.config.ts sets output: "standalone" — this copies only the pruned
# production dependency tree the server actually needs, not full node_modules.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
