# Start from the updated base image
FROM node:20.14.0-alpine3.20 AS builder

WORKDIR /diy-app

COPY ../package*.json .
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm ci


COPY server/ server/


WORKDIR /diy-app/server
RUN npm run build

EXPOSE 3000

# Default command
CMD ["npm", "run", "prod"]