# Dockerfile para Auth Service
FROM node:18-alpine

# Definir ARG para APP_NAME que se puede pasar durante la construcción
ARG APP_NAME="Auth Service"
ARG JWT_SECRET="secret"

# Establecer ENV a partir del ARG
ENV APP_NAME=${APP_NAME}
ENV JWT_SECRET=${JWT_SECRET}

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
