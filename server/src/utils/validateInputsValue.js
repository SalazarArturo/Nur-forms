function validateEmail(email){
    const regex = /@nur\.edu\.bo$/;
    if(email.trim() == ''){
        return {
            success: false,
            error: 'No puede dejar este campo vacio'
        }
    }
    if(!regex.test(email)){
        return {
            success: false,
            error: 'Formato de email invalido'
        }
    }
    return {
        success: true
    }
}

function validateInput(inputValue){
    if(inputValue.trim() == ''){
        return {
            success: false,
            error: 'No puede dejar este campo vacio'
        }
    }
    return {
        success: true
    }
}

function validateRole(role){
    const validRoles = ['admin', 'creator', 'respondent'];
    if(!validRoles.includes(role)){
        return {
            success: false,
            error: 'Rol inválido'
        };
    }
    return{
        success: true
    };
}

module.exports = {
    validateEmail,
    validateInput,
    validateRole
}