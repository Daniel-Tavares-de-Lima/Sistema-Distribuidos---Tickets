const jwt = require("jsonwebtoken");

//--Gera um token JWT para o usuário
// * @param {Object} //-- Os dados a serem incluídos no token
// * @returns {String} //--Token JWT


function gerarToken(load){
    const secreto = process.env.JWT_SECRET;
    const expira = process.env.JWT_EXPIRES_IN

    if(!secreto){
        alert("JWT não está definido");
    }
    //--Gera o token com os dados do usuário
    return jwt.sign(load, secreto, {
        expiresIn: expira
    })
}


//---Verifica e decodifica um token JWT
function verificarToken(token){
    const secret = process.env.JWT_SECRET;

    try{
        //---Verifica a assinatura e decodifica o payload
        const docoded = jwt.verify(token,secret);
        return decoded;

    } catch(error){
        //--Token inválido
        throw new Error("Token invalido ou expirado!")
    }

}

module.exports = {
    gerarToken,
    verificarToken
}