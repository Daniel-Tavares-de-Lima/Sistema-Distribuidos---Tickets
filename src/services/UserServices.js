
// const { valida } = require("../app/controllers/AuthController");
const { hash } = require("bcryptjs");
const { User } = require("../app/models");
const { formatCpf, isValidLength} = require("../utils/cpfValidator");
const {hashPassword} = require("../utils/passwordHelp");
// const { success, error } = require("../utils/responseFormatter");
const {Op} = require("sequelize");

class UserServices{
    //---Valida dados de criação do usuário
    async validateUserData(email, cpf, password){
        const errors = [];

        //---Campos obrigatórios
        if(!email || !password || !cpf){
            errors.push("Campos Obrigatórios: email, senha e cpf");
        }

        //--Valida email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.push('Email inválido');
        }

        
        //---Valida tamanho do CPF
        if(cpf && !isValidLength(cpf)){
            errors.push("CPF deve ter 11 digitos");
        }

        // console.log(errors)

        return{
            valid: errors.length === 0,
            errors
        }

        

    }

    //---Verifica se o email já existe
    async checkEmailExists(email, excludeUserId = null){
        const where = {email};

        
        if(excludeUserId){
            where.id_user = {
                [Op.ne]: excludeUserId
            }
        }

        //--Faz a busca no banco
        const user = await User.findOne({where})

        return !!user;
        // if(user){
        //     throw new Error("Email já cadastrado!");
        // }

        // return false;
    }


    //---Verifica se CPF já existe
    async checkCpfExists(cpf, excludeUserId = null){
        const format = formatCpf(cpf);
        const where = {cpf: format}

        if(excludeUserId){
            where.id_user = {
                [Op.ne]: excludeUserId
            }
        }

        const user = await User.findOne({where});

        return !!user; //--Retorna true se encontrou
        // if(user){
        //     throw new Error("CPF já cadastrado!");
        // }

        // return false
    }


    // ---Cria um novo usuário
    async createUser(data){
        const {name, email, password, cpf, role} = data;

        //--valida dados
        const validation = await this.validateUserData(email, cpf, password);
        if(!validation.valid){
            return{
                success: false,
                errors: validation.errors
            }
        }

        //----Verifica se já existe cpf e email
        const emailExists = await this.checkEmailExists(email);
        // console.log(emailExists)
        if(emailExists){
            return {
                success: false,
                errors: ["Email já cadastrado!"]
            }
        }

        const cpfExists = await this.checkCpfExists(cpf);
        if(cpfExists){
            return{
                success: false,
                errors: ["CPF já cadastrado"]
            }
        }
        //--Hash da senha
        const hashedPassword = await hashPassword(password);

        //---Cria um novo usuário
        try{
            const user = await User.create({
              name, email, password, cpf: formatCpf(cpf), role
            })

            return {
            success: true,
            user
            };
        }catch(error){
            console.error("Erro ao criar usuário:", error);
            if (error.errors) {
                console.error("Detalhes:", error.errors.map((e) => e.message));
            }

            return {
                success: false,
                errors: ["Erro ao criar usuário", error.message],
            };

                
        }

        //---Remove a senha do objeto que retorna
        // const userClean = user.get({plain: true});
        // delete userClean.password;


        
    }

    //---Atualiza usuário
    async updateUser(id, data) {
    const user = await User.findByPk(id);

    if (!user) {
      return {
        success: false,
        errors: ['Usuário não encontrado'],
      };
    }

    const { email, cpf, password, role } = data;
    const errors = [];

    // Verifica email se estiver mudando
    if (email && email !== user.email) {
      const emailExists = await this.checkEmailExists(email, id);
    //   console.log(emailExists)
      if (emailExists) {
        errors.push('Email já está em uso');
      }
    }

    // Verifica CPF se estiver mudando
    if (cpf && formatCpf(cpf) !== user.cpf) {
      if (!isValidLength(cpf)) {
        errors.push('CPF inválido');
      } else {
        const cpfExists = await this.checkCpfExists(cpf, id);
        if (cpfExists) {
          errors.push('CPF já está em uso');
        }
      }
    }

    // Se houver erros, retorna
    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    // Atualiza usuário
    await user.update({
      ...(email && { email }),
      ...(password && { password }), // Hook do model criptografa
      ...(cpf && { cpf: formatCpf(cpf) }),
      ...(role && { role }),
    });

    await user.reload();

    return {
      success: true,
      user,
    };
  }


  //---Busca usuário por ID

  async getUserById(userId) {
    //---Busca usuário pelo id excluindo a senha
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return {
        success: false,
        errors: ['Usuário não encontrado'],
      };
    }

    return {
      success: true,
      user,
    };
  }

  //--Para listar usuários
  async listUsers(page = 1, limit = 10){
    const offset = (page - 1) * limit;
    //---Ordena os usuários em ordem do mais recente
    const {count, rows: users} = await User.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
        attributes: {exclude: ["password"]}
    });

    return{
        users,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
    }
  }

  ///---Deletar usuário
  async deleteUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      return {
        success: false,
        errors: ['Usuário não encontrado'],
      };
    }

    await user.destroy();

    return {
      success: true,
    };
  }
}

module.exports = new UserServices();