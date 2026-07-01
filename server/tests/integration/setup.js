require('dotenv').config()
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL

const { sequelize } = require('../../src/config/db')

module.exports = async () => {
  await sequelize.sync({ force: true })
  
}