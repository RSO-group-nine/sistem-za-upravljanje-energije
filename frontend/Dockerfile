FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install --i

COPY . .

CMD ["npm", "start"]