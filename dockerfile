# # 빌드 단계
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --frozen-lockfile
# COPY . .

# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# RUN npm run build

# # 실행 단계
# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app ./
# EXPOSE 3000
# CMD ["npm", "start"]


FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile        # 전체 설치 (devDependencies 포함)
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# production stage
FROM node:18-alpine
WORKDIR /app

# package.json & production 모듈만 복사
COPY package*.json ./
RUN npm ci --only=production

# build 결과물만 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
