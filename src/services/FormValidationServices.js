
///---Utilss------
class FormValidationService {

    
  validateResponse(form, responseContent) {
    const errors = [];

    // Verifica se responseContent é um objeto válido
    if (!responseContent || typeof responseContent !== 'object') {
      return {
        valid: false,
        errors: ['Content deve ser um objeto JSON válido'],
      };
    }

    // Verifica se o content não está vazio
    if (Object.keys(responseContent).length === 0) {
      errors.push('Content não pode estar vazio');
    }

    // Validações opcionais que podem ser úteis
    // Você pode adicionar mais validações específicas aqui conforme necessário

    return {
      valid: errors.length === 0,
      errors,
    };
  }


   // Valida se é um email válido
   
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  
   // Valida se é uma data válida
   
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  
   // Valida se é um número válido
  
  isValidNumber(value) {
    return !isNaN(value) && isFinite(value);
  }

  //--Valida se valor está em lista de opções
  isInOptions(value, options){
    return options.includes(value);
  }

  //---Valida campos obrigatórios de um objeto
  validateRequiredFields(data, requiredFields){
    const errors = [];

    requiredFields.forEach((field) =>{
        if(!data[field] || data[field] === ""){
            errors.push(`Campos obrigatórios: ${field}`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    }
  }
}

module.exports = new FormValidationService();
