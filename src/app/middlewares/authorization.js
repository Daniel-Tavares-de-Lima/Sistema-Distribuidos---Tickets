
//--Middleware que verifica se o usuário tem a permissão necessária
const checkRole = (...allowedRole) => {
    return(req,res,next) => {
        if(!req.user){
            return res.status(401).json({
                error: "Usuário não autenticado"
            })
        }

        //---Verifica se o role do usuário está na linha de roles permitidos
        if(!allowedRole.includes(req.user.role)){
            console.log(req.user.role);
            return res.status(401).json({
                error: "Acesso negado"
            })
        }

        return next();
    }
}

// para verificar se é usuário INTERNO
const interno = () => {
  return checkRole('interno');
};

// para verificar se é EXTERNO
const externo = () => {
  return checkRole('externo');
};

// Permite INTERNO e EXTERNO
const isAuthenticated = () => {
  return checkRole('interno', 'externo');
};


module.exports = {
  checkRole,
  interno,
  externo,
  isAuthenticated,
};