FROM node:6

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/
RUN npm install
RUN npm run build

# Ports: HTTP HTTPS
EXPOSE 8080 8181

CMD [ "npm", "start" ]
