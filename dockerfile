# Dockerfile para Auth Service
FROM node:18-alpine

# Definir ARG para APP_NAME que se puede pasar durante la construcción
ARG APP_NAME="Auth Service"
ARG JWT_SECRET="secret"
ARG DB_NAME="databse"
ARG DB_USER="username"
ARG DB_PASSWORD="password"
ARG DB_HOST="host"

# Establecer ENV a partir del ARG
ENV APP_NAME=${APP_NAME}
ENV JWT_SECRET=${JWT_SECRET}
ENV DB_NAME=${DB_NAME}
ENV DB_USER=${DB_USER}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_HOST=${DB_HOST}

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto (asumiendo que la aplicación usa el puerto 3000)
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["npm", "start"]
