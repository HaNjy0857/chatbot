# 建置階段
FROM node:14 as build

WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製源代碼
COPY . .

# 建置專案
RUN npm run build

# 執行階段
FROM nginx:alpine

# 從建置階段複製建置結果到 nginx
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# 複製 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
