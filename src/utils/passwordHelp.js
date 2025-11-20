const bcrypt = require("bcryptjs");
const { password } = require("../config/config");

//--Criptografa uma senha com hash
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(8);
  return bcrypt.hash(password, salt);
};

//---Compara a senha de texto com a do Hash
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
