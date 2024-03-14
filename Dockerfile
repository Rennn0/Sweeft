FROM node

WORKDIR /usr/src

COPY package*.json ./
RUN npm install

COPY ./dist .
COPY .env .

CMD [ "node","index.js" ]
