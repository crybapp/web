FROM node:lts-buster

WORKDIR /usr/src/app
COPY . .

RUN yarn
RUN yarn build

EXPOSE 3000

CMD [ "npm", "start" ]
