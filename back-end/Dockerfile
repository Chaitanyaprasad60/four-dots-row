FROM node:10

COPY package*.json ./

RUN npm install

ARG frontEnd='https://chaitanyaprasad60.github.io/'

COPY . .

EXPOSE 3000

CMD ["npm", "start"]