FROM node:18 as build-stage

WORKDIR /srv/aramis/swissgrid

COPY package.json package-lock.json ./
RUN npm install

COPY . ./

# Construction de l'application pour la production
RUN npm run build -- --output-path=./dist/out --configuration production --base-href=https://vlhmobetic.hevs.ch/swissgrid/

# Etape de dEploiement avec Nginx
FROM nginx:1.15

# Copie des fichiers construits depuis l'etape de construction
COPY --from=build-stage /srv/aramis/swissgrid/dist/out/ /usr/share/nginx/html/vsdr

# Copie de la configuration Nginx si necessaire
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
