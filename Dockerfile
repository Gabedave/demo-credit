
FROM node:18

RUN apt-get update

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN  npm install

COPY . .

RUN npm run build && npm cache clean --force

# development envvironment variables, should be overwritten by docker-compose variables in production
ENV PORT=3000
ENV MYSQL_HOST=localhost
ENV MYSQL_PORT=3306
ENV MYSQL_USER=david
ENV MYSQL_PASSWORD=password
ENV DB_NAME=demo_credit
# end of environment variables

EXPOSE 3000
CMD node /usr/src/app/dist
