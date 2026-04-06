const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const { v4: uuidv4 } = require('uuid')

const Invitation = sequelize.define('invitations', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  form_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    unique: true,
    defaultValue: () => uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '')
  },
  status: {
    type: DataTypes.ENUM('pending', 'opened', 'submitted', 'expired'),
    defaultValue: 'pending'
  },
  sent_at: {
    type: DataTypes.DATE
  },
  expires_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'invitations',
  updatedAt: false,
  indexes: [{ unique: true, fields: ['form_id', 'email'] }]
})

module.exports = Invitation
