FROM docker:29-cli AS docker-cli

FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker

WORKDIR /app

COPY scripts/problems/judge-worker.mjs ./scripts/problems/judge-worker.mjs

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

CMD ["node", "scripts/problems/judge-worker.mjs"]
