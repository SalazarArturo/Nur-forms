const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const NotificationSetting = sequelize.define('notification_settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  form_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  notify_on_threshold: {
    type: DataTypes.INTEGER
  },
  notify_on_close: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notify_respondent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  threshold_notified_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'notification_settings',
  updatedAt: false
})

module.exports = NotificationSetting
