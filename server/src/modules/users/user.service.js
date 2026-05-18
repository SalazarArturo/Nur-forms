const userRepository = require('../../repositories/user.repository.js');

const getAllUsers = async () => {
  const users = await userRepository.getAllUsers();
  return users;
};

const getUserById = async (id) => {
  const user = await userRepository.getUserById(id);
  if (!user) throw new Error('Usuario no encontrado');
  return user;
};

const searchUsers = async (emailQuery) => {
  if (!emailQuery || emailQuery.trim() === '') throw new Error('Ingrese un email para buscar');
  return await userRepository.getUserByEmail(emailQuery.trim());
};

const updateUserRole = async (id, role) => {
  const user = await userRepository.getUserById(id);
  if (!user) throw new Error('Usuario no encontrado');

  const validRoles = ['admin', 'creator', 'respondent'];
  if (!validRoles.includes(role)) throw new Error('Rol invalido');

  const updated = await userRepository.updateUserById(id, { role });
  if (!updated) throw new Error('No se pudo actualizar el rol, intente nuevamente');

  return { id: updated.id, email: updated.email, full_name: updated.full_name, role: updated.role };
};

const toggleUserActive = async (id) => {
  const user = await userRepository.getUserById(id);
  if (!user) throw new Error('Usuario no encontrado');

  const updated = await userRepository.updateUserById(id, { is_active: !user.is_active });
  if (!updated) throw new Error('No se pudo cambiar el estado del usuario, intente nuevamente');

  return { id: updated.id, email: updated.email, full_name: updated.full_name, is_active: updated.is_active };
};

module.exports = { getAllUsers, getUserById, searchUsers, updateUserRole, toggleUserActive };