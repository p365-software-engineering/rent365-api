FROM node:8.12-jessie
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN  ["git", "clone", "https://github.com/p365-software-engineering/rent365-api.git"]
WORKDIR rent365-api
RUN npm install --production --silent 
EXPOSE 3000
CMD ["node", "."]