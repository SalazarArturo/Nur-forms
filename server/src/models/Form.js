const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Form = sequelize.define('forms', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campaign_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  cover_image_url: {
    type: DataTypes.STRING
  },
  primary_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#4F46E5'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'closed', 'archived'),
    defaultValue: 'draft'
  },
  access_type: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public'
  },
  anonymous_mode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shuffle_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  show_progress_bar: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  paginate_sections: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  max_responses_per_user: {
    type: DataTypes.SMALLINT,
    defaultValue: 1
  },
  max_total_responses: {
    type: DataTypes.INTEGER
  },
  opens_at: {
    type: DataTypes.DATE
  },
  closes_at: {
    type: DataTypes.DATE
  },
  welcome_message: {
    type: DataTypes.TEXT
  },
  thank_you_message: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'forms'
})

module.exports = Form
