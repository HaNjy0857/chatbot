# 建置階段
FROM node:18 as build

WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製源代碼
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
