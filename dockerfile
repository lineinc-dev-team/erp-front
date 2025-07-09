# 빌드 단계
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .

# 빌드시에 전달받은 --build-arg NEXT_PUBLIC_API_URL=... 값을 ENV로 등록.
# Next.js 는 NEXT_PUBLIC_ 으로 시작하는 환경변수만 클라이언트에 노출됨.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# 실행 단계
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
