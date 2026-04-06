const bcrypt = require('bcryptjs')
const userRepository = require('../../repositories/user.repository.js');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt')

const register = async ({ email, password, full_name }) => {
  try {

    const existing = await userRepository.getUserByEmail(email);

    if (existing) {
      return{
        success: false,
        error: 'Este email ya pertenece a una cuenta existente, intenta con otra direccion'
      }
    }
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await userRepository.createUser({email, password_hash, full_name, role: 'respondent'});
    if(!newUser){
      return {
        success: false,
        error: 'No se pudo crear nuevo usuario, intente nuevamente'
      }
    }

    const payload = { id: newUser.id, email: newUser.email, role: newUser.role };

    const tokenSession = generateAccessToken(payload);
    const refreshedTokenSession = generateRefreshToken(payload);

    return{
      success: true,
      userData:{
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role
      },
      tokenSession,
      refreshedTokenSession
    }
  } catch (error) {
    throw error;
  }
}

const login = async ({ email, password }) => {

  const result = await userRepository.getUserByEmail(email)

  if (!result || !result.is_active) {
    throw new Error('Usuario o contraseña incorrectos')
  }

  const passwordMatch = await bcrypt.compare(password, result.password_hash)
  if (!passwordMatch) {
    throw new Error('Usuario o contraseña incorrectos')
  }

  const payload = { id: result.id, email: result.email, role: result.role }
  const token = generateAccessToken(payload)

  return {
    token,
    user: {
      id: result.id,
      email: result.email,
      full_name: result.full_name,
      role: result.role
    }
  }
}
module.exports = { register, login }
