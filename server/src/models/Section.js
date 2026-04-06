const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Section = sequelize.define('sections', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  form_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT
  },
  position: {
    type: DataTypes.SMALLINT,
    defaultValue: 0
  }
}, {
  tableName: 'sections'
})

module.exports = Section