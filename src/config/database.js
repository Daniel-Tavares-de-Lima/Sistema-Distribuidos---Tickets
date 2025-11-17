require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'project_ticket',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desativa logs SQL no console (deixe true para debug)
    timezone: '-03:00', // Fuso horário de Brasília
    define: {
      timestamps: true, // Adiciona createdAt e updatedAt automaticamente
      underscored: true, // Usa snake_case nos nomes das colunas (created_at)
      underscoredAll: true,
    },
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME_TEST || 'project_ticket',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '-03:00',
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '-03:00',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
  },
};