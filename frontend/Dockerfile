# Etapa de desarrollo
FROM node:20-alpine

WORKDIR /app

# 1. Copia solo los archivos de dependencias primero (caché eficiente)
COPY package*.json ./

# 2. Instala dependencias (incluye devDependencies)
RUN npm install

# 3. Copia el resto del código
COPY . .

# 4. Variables de entorno para HMR
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# 5. Puerto expuesto
EXPOSE 3000

# 6. Comando para desarrollo (con hot reload)
CMD ["npm", "start"]


