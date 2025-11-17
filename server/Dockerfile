FROM node:latest

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install 

COPY . .

RUN pnpm build

EXPOSE 9000

CMD ["pnpm", "start"]
