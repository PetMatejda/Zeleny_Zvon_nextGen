FROM node:18-alpine

WORKDIR /app

# Kopírování závislostí
COPY package.json package-lock.json* ./
RUN npm install --production

# Kopírování ostatních souborů
COPY . .

# Příprava portu
EXPOSE 3000
ENV PORT=3000

# Spuštění serveru
CMD ["npm", "start"]
