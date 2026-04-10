const userRepository = require('../../repositories/user.repository.js');
const inputValidator = require('../../utils/validateInputsValue.js');
const bcrypt = require('bcryptjs');

const getAll = async () => {
  /*return User.findAll({
    attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at']
  })*/
 const users = await userRepository.getAllUsers(); // y aqui users vendria a ser ese error del repository ? entonces por eso es conveniente hacer una validacion con if(!users) si users es falsy .. asi cubrimos los casos null, undefines, etc .. y ya desde aqui lanzamos un nuevo error ? que sera el que recibira el controller ?
 return users; // esto puede o ser un array vacio o un array con elementos (validar en el front) no es necesariamente un error 
}

const getById = async (id) => {
  /*const user = await User.findByPk(id, {
    attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at']
  })
  if (!user) throw new Error('Usuario no encontrado')
  return user*/
  const user = await userRepository.getUserById(id);
  if(!user) throw new Error('Usuario no encontrado'); //y en este caso la db nos retorna un solo objeto del modelo usuarios entonces esta validacion podrian ser por 2 cosas ... si la db fallo o si todo salio bien pero efectivamente no hay el usuario de ser asi que es lo que nos retorna el modelo? una instancia vacia o un null ? 
  return user;
}

const updateRole = async (id, role) => { //check
  const user = await userRepository.getUserById(id); //lo mismo para esto
  if (!user) throw new Error('Usuario no encontrado');

  const validRoles = ['admin', 'creator', 'respondent'];
  if (!validRoles.includes(role)) throw new Error('Rol invalido');

  const updatedUser = await userRepository.updateUserById(user.id, {role: role});
  if(!updatedUser) throw new Error('No se pudo actualizar al usuario');

  return { id: updatedUser.id, email: updatedUser.email, full_name: updatedUser.full_name, role: updatedUser.role }
}

const toggleActive = async (id) => {
  const user = await userRepository.getUserById(id); // y esto... 
  if (!user) throw new Error('Usuario no encontrado')

  const updatedUser = await userRepository.updateUserById(id, {is_active: !user.is_active});

  if(!updatedUser) throw new Error(`No se pudo actualizar el estado del usuario ${user.full_name}, intente nuevamente`);
 
  return { id: updatedUser.id, email: updatedUser.email, is_active: updatedUser.is_active}
  
}

const processNewUser = async (newUserCredentials) =>{

  const emailResult = inputValidator.validateEmail(newUserCredentials.email);
  const full_nameResult = inputValidator.validateInput(newUserCredentials.full_name);
  const passwordResult = inputValidator.validateInput(newUserCredentials.password);
  const roleResult = inputValidator.validateRole(newUserCredentials.role);

  if(!emailResult.success){
   throw new Error(`${emailResult.error}`);
  }
  if(!full_nameResult.success){
    throw new Error(`${full_nameResult.error}`);
  }
  if(!passwordResult.success){
   throw new Error(`${passwordResult.error}`);
  }
  if(!roleResult.success){
    throw new Error(`${roleResult.error}`);
  }

  const verifyEmail = await userRepository.getUserByEmail(newUserCredentials.email);
  if(verifyEmail){
    throw new Error('Esta direccion de correo ya esta siendo ocupada, porfavor ingrese otra');
  }

  const hashedPassword = await bcrypt.hash(newUserCredentials.password, 10);

  const newUser = await userRepository.createUser({
    email: newUserCredentials.email,
    password_hash: hashedPassword,
    full_name: newUserCredentials.full_name,
    role: newUserCredentials.role
  });

  if(!newUser) throw new Error('Error al crear el usuario, intente nuevamente');
  return newUser;
}

async function deleteUserService(userId){
  try {
    const user = await userRepository.getUserById(userId);
    if(!user) throw new Error('El usuario no existe');

    const campaignResult = await userRepository.countUserCampaigns(userId);
    if(campaignResult > 0){
      throw new Error('El usuario tiene campañas pendientes, debe terminar el ciclo de esta para poder ejecutar la accion');
    }
    const submissionResult = await userRepository.countUserSubmissions(userId);
    if(submissionResult > 0){
      throw new Error('Este usuario es respondiente de una campaña activa, debe terminar el ciclo de esta para poder ejecutar la accion');
    }
    await userRepository.deleteUser(userId);
  } catch (error) {
    throw error;
  }
}
module.exports = { getAll, getById, updateRole, toggleActive, processNewUser, deleteUserService }
