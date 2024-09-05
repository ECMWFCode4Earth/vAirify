FROM node:22.4.0-alpine AS development

WORKDIR /app

COPY package.json package.json
RUN npm i --verbose
RUN ls -al node_modules

COPY . .

CMD ["npm", "run", "dev"]
# CMD ["sleep", "infinity"]

FROM development AS build

ARG VITE_AIR_QUALITY_API_URL
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=build /app/dist .

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
