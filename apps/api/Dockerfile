# 开发环境
FROM node:20-alpine

WORKDIR /app

# 安装依赖
RUN npm install -g @nestjs/cli

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]
