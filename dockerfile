# 빌드 단계
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_URL_V2

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL_V2=$NEXT_PUBLIC_API_URL_V2

RUN npm run build

# 실행 단계
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]

