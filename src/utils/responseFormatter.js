
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
            total,
            // totalPages: Math.ceil(total / limit),
            // currentPage: parseInt(page),
            // perPage: parseInt(limit),
            hasNext: page * limit < total,
            hasPrevious: page > 1
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