FROM node:latest

WORKDIR /app

RUN npm install -g npm

COPY package*.json ./
RUN npm install 

COPY . .

# RUN npm build

EXPOSE 9000

CMD ["npm", "start"]
