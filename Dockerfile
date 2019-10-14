FROM node:10

WORKDIR /usr/src/app
COPY . .

RUN yarn
RUN yarn build

EXPOSE 3000

CMD [ "npm", "start" ]