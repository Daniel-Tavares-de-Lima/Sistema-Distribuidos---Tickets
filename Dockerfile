# Usa Node.js 18 LTS
FROM node:18-alpine

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos de dependências
COPY package*.json ./

# Garante que todas as dependências (dev e prod) sejam instaladas
RUN npm install --legacy-peer-deps

# Copia todo o código da aplicação
COPY . .

# Expõe porta da API
EXPOSE 3000

# Comando para rodar a aplicação em dev com sucrase
CMD ["npx", "nodemon", "-r", "sucrase/register", "src/server.js"]
