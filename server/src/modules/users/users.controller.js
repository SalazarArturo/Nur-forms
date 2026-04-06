const usersService = require('./users.service')

const getAll = async (req, res) => {
  try {
    const users = await usersService.getAll()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const user = await usersService.getById(req.params.id)
    res.status(200).json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const updateRole = async (req, res) => {
  try {
    const { role } = req.body
    const user = await usersService.updateRole(req.params.id, role)
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const toggleActive = async (req, res) => {
  try {
    const user = await usersService.toggleActive(req.params.id)
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { getAll, getById, updateRole, toggleActive }
