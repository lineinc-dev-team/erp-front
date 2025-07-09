# 1단계: 빌드 (멀티스테이지)
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: 실행용 이미지
FROM node:18 AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public

EXPOSE 3000

CMD ["npm", "start"]
