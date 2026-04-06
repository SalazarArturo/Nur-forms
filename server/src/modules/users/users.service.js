const { User } = require('../../models')

const getAll = async () => {
  return User.findAll({
    attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at']
  })
}

const getById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at']
  })
  if (!user) throw new Error('Usuario no encontrado')
  return user
}

const updateRole = async (id, role) => {
  const user = await User.findByPk(id)
  if (!user) throw new Error('Usuario no encontrado')

  const validRoles = ['admin', 'creator', 'respondent']
  if (!validRoles.includes(role)) throw new Error('Rol inválido')

  await user.update({ role })
  return { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
}

const toggleActive = async (id) => {
  const user = await User.findByPk(id)
  if (!user) throw new Error('Usuario no encontrado')

  await user.update({ is_active: !user.is_active })
  return { id: user.id, email: user.email, is_active: user.is_active }
}

module.exports = { getAll, getById, updateRole, toggleActive }
