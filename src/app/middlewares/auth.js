const jwt = require('jsonwebtoken');
const { format } = require('path');
const { promisify } = require('util');

///---Pega o token do header Auth, valida o formato Bearer
module.exports = async (req, res, next) =>{
    try{
        ///---Pega o token do header
        const authHeader = req.headers.authorization;

        //--Verifica se o token foi enviado
        if(!authHeader){
            return res.status(401).json({
                error: "Token não enviado"
            })
        }

        //--valida o formato
        const formato = authHeader.split(" ");

        if(formato.length !== 2){
            return res.status(400).json({
                error: "Formato de token inválido"
            })
        }

        const [scheme, token] = formato
        // "Bearer"
        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({
                error: 'Token mal formatado',
            });
        }

        //--Decodifica o token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

        //--Para uso dos controllers
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        //-----IMPORTANTEEE
        return next();
    }catch(error){
        if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({
                error: "Token inválido"
            })
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
            error: 'Token expirado',
            });
        }

        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({
            error: 'Erro ao validar token',
        });
    }
}