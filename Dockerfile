
### STAGE 1: Build ###
FROM node:lts-alpine AS build

#### make the 'app' folder the current working directory
WORKDIR /srv/swissgrid/frontend

#### copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

#### install angular cli
RUN npm install -g @angular/cli

#### install project dependencies
RUN npm install

#### copy things
COPY . .

#### generate build
RUN npm run build -- --output-path=./dist/swissgrid --configuration production --base-href=https://vlhmobetic.hevs.ch/swissgrid/

### STAGE 2: Run ###
FROM nginx:1.15

#### copy nginx conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

#### copy artifact build from the 'build environment'
COPY --from=build /srv/swissgrid/frontend/dist/swissgrid /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
