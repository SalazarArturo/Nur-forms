const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const CampaignMember = sequelize.define('campaign_members', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campaign_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('owner', 'editor', 'viewer'),
    defaultValue: 'viewer'
  }
}, {
  tableName: 'campaign_members',
  updatedAt: false,
  indexes: [{ unique: true, fields: ['campaign_id', 'user_id'] }]
})

module.exports = CampaignMember
