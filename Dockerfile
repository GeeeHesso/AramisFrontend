FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration=production

FROM nginx:1.15

COPY --from=build app/dist/swissgrid /usr/share/nginx/html

EXPOSE 80
