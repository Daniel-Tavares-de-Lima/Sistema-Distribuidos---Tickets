# Dockerfile
# Usa a imagem oficial do Node.js 18 (LTS)
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código da aplicação
COPY . .

# Expõe a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]