FROM node:22.7.0-alpine

WORKDIR /app

COPY package.json ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3001
CMD ["yarn", "start"]

