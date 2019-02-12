FROM yarn:latest

WORKDIR /opt/app

COPY package*.json ./
RUN yarn

COPY ./dist ./dist

CMD ["yarn","start"]
