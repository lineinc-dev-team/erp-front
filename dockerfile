# # 1단계: 빌드 (멀티스테이지)
# # 노드 18버전을 만들어서  이름을 builder 라고 지정 (나중에 FROM builder 대신 COPY --from=builder 로 사용하기 위해).
# FROM node:18 AS builder 

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# RUN npm run build

# # 2단계: 실행용 이미지
# FROM node:18 AS runner

# WORKDIR /app

# COPY package*.json ./
# RUN npm install --omit=dev

# COPY --from=builder /app/.next .next
# COPY --from=builder /app/public public

# EXPOSE 3000

# CMD ["npm", "start"]


# 빌드
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 실행
FROM node:18 AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
