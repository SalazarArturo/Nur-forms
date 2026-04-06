const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Answer = sequelize.define('answers', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  submission_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  text_value: {
    type: DataTypes.TEXT
  },
  boolean_value: {
    type: DataTypes.BOOLEAN
  },
  selected_option_ids: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  matching_pairs: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'answers',
  indexes: [{ unique: true, fields: ['submission_id', 'question_id'] }]
})

module.exports = Answer
