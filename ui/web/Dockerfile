FROM node:16-alpine3.11

WORKDIR /app

ENV PORT 80

COPY . /app

RUN yarn

CMD ["yarn", "run", "dev"]