FROM node:16-alpine

WORKDIR /usr/src/app
COPY . .

RUN yarn
RUN yarn build

EXPOSE 3000

CMD [ "npm", "start" ]
