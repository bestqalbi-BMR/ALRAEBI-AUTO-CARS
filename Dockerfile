FROM node:20-bookworm-slim
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node","server/server.js"]
