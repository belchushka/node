FROM node:19.9.0

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn cache clean && yarn install

COPY prisma ./prisma/

ENV NODE_ENV=production

RUN npx prisma generate

COPY . ./

RUN yarn build:prod

CMD [ "yarn", "start:prod" ]