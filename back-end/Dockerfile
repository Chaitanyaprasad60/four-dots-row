FROM node:10

COPY package*.json ./

RUN npm install

ARG frontEnd='https://chaitanyaprasad60.github.io'

COPY . /opt/app-root/src

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]