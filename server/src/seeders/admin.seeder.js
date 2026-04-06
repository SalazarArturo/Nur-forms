require('dotenv').config()
const bcrypt = require('bcryptjs')
const { sequelize } = require('../config/db')
const { User } = require('../models')

const seed = async () => {
  try {
    await sequelize.authenticate()

    const existing = await User.findOne({ where: { email: 'admin@nur.edu.bo' } })
    if (existing) {
      console.log('El admin ya existe, nada que hacer.')
      process.exit(0)
    }

    const password_hash = await bcrypt.hash('admin1234', 10)
    await User.create({
      email: 'admin@nur.edu.bo',
      password_hash,
      full_name: 'Administrador NUR',
      role: 'admin'
    })

    console.log('Admin creado exitosamente.')
    console.log('Email:    admin@nur.edu.bo')
    console.log('Password: admin1234')
    console.log('Cambiá la password apenas puedas.')
    process.exit(0)
  } catch (error) {
    console.error('Error al crear admin:', error.message)
    process.exit(1)
  }
}

seed()
