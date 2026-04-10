const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const { v4: uuidv4 } = require('uuid')

const Submission = sequelize.define('submissions', { //esta tabla es para los respondientes a encuestas privadas
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  form_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID
  },
  invitation_id: {
    type: DataTypes.UUID
  },
  respondent_token: {
    type: DataTypes.STRING,
    unique: true,
    defaultValue: () => uuidv4().replace(/-/g, '')
  },
  respondent_email: {
    type: DataTypes.STRING
  },
  ip_address: {
    type: DataTypes.STRING
  },
  is_complete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_draft: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  submitted_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'submissions'
})

module.exports = Submission
