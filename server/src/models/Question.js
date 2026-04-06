const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Question = sequelize.define('questions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  form_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Nueva FK a secciones (opcional, una pregunta puede no tener sección)
  section_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('single_choice', 'multiple_choice', 'true_false', 'matching', 'short_text', 'long_text'),
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  help_text: {
    type: DataTypes.TEXT
  },
  is_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  position: {
    type: DataTypes.SMALLINT,
    defaultValue: 0
  },
  // Nuevo campo: barajar opciones de esta pregunta individualmente
  shuffle_options: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'questions'
})

module.exports = Question