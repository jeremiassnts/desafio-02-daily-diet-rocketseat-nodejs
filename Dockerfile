FROM node:18.12.1

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

VOLUME /db /db
VOLUME /src /src

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3333

CMD ["npm", "run", "dev"]