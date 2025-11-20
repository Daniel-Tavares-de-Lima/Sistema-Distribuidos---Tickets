

///---Remover caracteres não números do CPF
const formatCpf = (cpf) => {
    return cpf.replace(/\D/g, "");
}

//---Valida se o CPF tem 11 dígitos
const isValidLength = (cpf) =>{
    const format = formatCpf(cpf);
    return format.length === 11;
}


//---Formata o CPf

// const cleanCpf = (cpf) =>{
//     const format = formatCpf(cpf);
//     return format.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
// };


module.exports = {
    formatCpf,
    isValidLength,
    // cleanCpf
}


