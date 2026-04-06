require('dotenv').config()
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('Conectado a PostgreSQL correctamente')
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error.message)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
