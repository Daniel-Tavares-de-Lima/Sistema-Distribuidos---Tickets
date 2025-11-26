
//---Formata resposta de sucesso
const success = (data, message = null) => {
    const response = {
        success: true
    }

    if(message){
        response.message = message;
    }

    if(data){
        response.data = data
    }

    return response;
}


//--Formata resposta de erro
const error = (message, details = []) =>{
    const response = {
        success: false,
        error: message
    }

    if(details){
        response.details = details;
    }

    return response;
}

//--Formata resposta paginada
const paginated = (items, total, page, limit) =>{
    return{
        success: true,
        data: items,
        pagination:{
            total, //---Total de registros
            totalPages: Math.ceil(total / limit), //--Total dividido pelo limit
            currentPage: parseInt(page), //----pagina atual
            perPage: parseInt(limit), //---quantos resultados por página
            hasNext: page * limit < total, //---se há próxima página
            hasPrevious: page > 1 //---Se há página anterior
        }
    }
}


///--Formata resposta de validação
const validationError = (errors) => {
    return{
        success: false,
        error: "Erro de validação",
        validationErrors: errors
    }
}


module.exports = {
    success,
    error,
    paginated,
    validationError
}