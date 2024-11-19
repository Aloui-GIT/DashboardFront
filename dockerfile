# Étape 1 : Construire l'application Angular
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Étape 2 : Servir l'application avec NGINX
FROM nginx:1.25
COPY --from=build /app/dist/interface2 /usr/share/nginx/html # Remplacez "interface2" par le dossier build réel
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
