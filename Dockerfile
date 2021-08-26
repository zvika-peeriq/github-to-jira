# Node server
FROM node:lts AS server
WORKDIR /usr/src/app
COPY ["./server/package*.json", "./server/tsconfig*.json", "./server/.eslintrc", "./server/.eslintignore", "./server/.prettierrc", "./"]
COPY ./server/src ./src
RUN npm ci --quiet; \
     npm run build;

# Final image
FROM alpine:3.14

WORKDIR /app

# Commands
COPY --from=server /usr/src/app ./
RUN apk update; \
    apk add --update nodejs npm; \
    npm ci --quiet --only=production;

# Default Env Variables:
ENV NODE_ENV='dev'
ENV PORT=8080
ENV SERVICE_NAME="Bankuish Character Service"
ENV MONGO_URI='mongodb://localhost:27017/'
ENV MONGO_USER='bankuish'
ENV MONGO_DB_NAME='bankuish'
ENV MONGO_PASSWORD='SecretPassword'
ENV EXTERNAL_API_URL='https://rickandmortyapi.com'


# Expose the port
EXPOSE 8080

# Run NodeJS app
CMD [ "node", "dist", "index.js" ]