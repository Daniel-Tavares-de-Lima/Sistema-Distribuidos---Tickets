const { Sequelize } = require("sequelize");
const dbConfig = require("../../config/config");
const env = process.env.NODE_ENV || "development";
const config = dbConfig[env];

const User = require("./User");
const Form = require("./Form");
// const FormResponse = require("./FormResponse");
// const Ticket = require("./Ticket");

// const env = "desenvolvendo";
// const config = dbConfig[env];

//--Instância do Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
//---- Inicializa todos os Models
User.init(sequelize);
Form.init(sequelize);
// FormResponse.init(sequelize);
// Ticket.init(sequelize);

const models = { User, Form };

//-- Associa todos os Models
console.log("Models carregados:", models);
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// User.init(sequelize);
// Form.init(sequelize);
// FormResponse.init(sequelize);
// Ticket.init(sequelize);
// FormQuestion.init(sequelize);
// FormResponse.init(sequelize);

//---- Inicializa todos os Models
// const models = {
//     User: User.init(sequelize),
//     Form: Form.init(sequelize)
// }

// Object.values(models)
//   .filter((model) => typeof model.associate === 'function')
//   .forEach((model) => model.associate(models));

module.exports = {
  sequelize,
  ...models,
};
