FROM node:14.15.4

EXPOSE 8080
WORKDIR /app

# install depndencies
COPY ./package*.json ./
RUN npm ci

# move only dist folder into container
COPY ./dist ./dist

CMD [ "npm", "run", "start" ]
