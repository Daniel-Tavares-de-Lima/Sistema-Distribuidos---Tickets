//--Controler que gerencia o login e a validação de usuários
const jwt = require("jsonwebtoken");
const { User } = require("../models");

class AuthController{
    //--LOGIN - Autentica usuário e retorna o token
    async login(req, res){
        try{
            const {email, password} = req.body;

            //--Validação
            if(!email || !password){
                return res.status(400).json({
                    error: "Email e senha são obrigatórios",
                });
            }

            //--Busca o usuário pelo email
            const user = await User.findOne({
                where: {email},
                attributes: ["id_user", "email", "password", "cpf", "role"]
            });

            //--Verifica se o usuário existe 
            if(!user){
                return res.status(401).json({
                    error: "Email ou senha incorretos"
                })
            }

            //--Verifica se a senha está correta
            const passwordCorrect = await user.checkPassword(password);
            if(!passwordCorrect){
                return res.status(401).json({
                    error: "Senha incorreta"
                });
            }

            //--Dados que vão dentro do token
            const data = {
                id: user.id_user,
                email: user.email,
                role: user.role
            }

            //---Gera o token JWT
            const token = jwt.sign(
                data, 
                process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                }
            );

            //--Retorna o token com os dados do usuário
            return res.json({
                user: {
                    id: user.id_user,
                    email: user.email,
                    cpf: user.cpf,
                    role: user.role
                },
                token
            });
        }catch(error){
            console.error("Erroa ao fazer login: ", error);
            return res.status(500).json({
                error: "Error ao fazer login"
            })
        }
    }
    //---
    //---Valida o token e retorna os dados do usuário
    async valida(req, res){
        try{
            //--Busca dados completo do usuário
            const user = await User.findByPk(req.user.id_user, {
                attributes: {exclude: ["password"]}
            })

            if(!user){
                return res.status(404).json({
                    error: "Usuário não encontrado",
                })
            }

            return res.json({user, authenticated: true})
                
            
        }catch(error){
            console.error("Erro ao validar token: ", error);
            return res.status(500).json({
                error: "Erro ao validar o token"
            })
        }
    }
}


///------MVC -- MODELS, VIEW, CONSTROLLER

module.exports = AuthController;