const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Campaign = sequelize.define('campaigns', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'closed', 'archived'),
    defaultValue: 'draft'
  },
  starts_at: {
    type: DataTypes.DATE
  },
  ends_at: {
    type: DataTypes.DATE
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'campaigns'
})

module.exports = Campaign
