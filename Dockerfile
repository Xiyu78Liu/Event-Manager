FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Zeabur 通过 PORT 环境变量指定端口，默认 8080
ENV PORT=8080

# 用 envsubst 替换配置中的端口
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE ${PORT}
CMD ["sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
