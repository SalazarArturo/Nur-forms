const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Option = sequelize.define('options', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  position: {
    type: DataTypes.SMALLINT,
    defaultValue: 0
  }
}, {
  tableName: 'options',
  updatedAt: false
})

module.exports = Option
