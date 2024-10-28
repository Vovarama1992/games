FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install dotenv
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]