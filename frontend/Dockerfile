# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build arguments
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_API_KEY
ARG VITE_MICROSOFT_CLIENT_ID

# Set environment variables
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_API_KEY=$VITE_GOOGLE_API_KEY
ENV VITE_MICROSOFT_CLIENT_ID=$VITE_MICROSOFT_CLIENT_ID

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
