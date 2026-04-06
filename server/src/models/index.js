const User                = require('./User')
const Campaign            = require('./Campaign')
const CampaignMember      = require('./CampaignMember')
const Form                = require('./Form')
const Section             = require('./Section')       //  nuevo
const Question            = require('./Question')
const Option              = require('./Option')
const Invitation          = require('./Invitation')
const Submission          = require('./Submission')
const Answer              = require('./Answer')
const NotificationSetting = require('./NotificationSetting')

// User asociaciones
User.hasMany(Campaign,       { foreignKey: 'created_by', as: 'campaigns' })
User.hasMany(CampaignMember, { foreignKey: 'user_id',    as: 'memberships' })
User.hasMany(Submission,     { foreignKey: 'user_id',    as: 'submissions' })

// Campaign asociaciones
Campaign.belongsTo(User,         { foreignKey: 'created_by',  as: 'creator' })
Campaign.hasMany(CampaignMember, { foreignKey: 'campaign_id', as: 'members', onDelete: 'CASCADE' })
Campaign.hasMany(Form,           { foreignKey: 'campaign_id', as: 'forms',   onDelete: 'CASCADE' })

// CampaignMember asociaciones
CampaignMember.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' })
CampaignMember.belongsTo(User,     { foreignKey: 'user_id',     as: 'user' })

// Form asociaciones
Form.belongsTo(Campaign,         { foreignKey: 'campaign_id', as: 'campaign' })
Form.belongsTo(User,             { foreignKey: 'created_by',  as: 'creator' })
Form.hasMany(Section,            { foreignKey: 'form_id',     as: 'sections',              onDelete: 'CASCADE' }) // ← nuevo
Form.hasMany(Question,           { foreignKey: 'form_id',     as: 'questions',             onDelete: 'CASCADE' })
Form.hasMany(Invitation,         { foreignKey: 'form_id',     as: 'invitations',           onDelete: 'CASCADE' })
Form.hasMany(Submission,         { foreignKey: 'form_id',     as: 'submissions',           onDelete: 'CASCADE' })
Form.hasOne(NotificationSetting, { foreignKey: 'form_id',     as: 'notification_settings', onDelete: 'CASCADE' })

// Section asociaciones   nuevo bloque
Section.belongsTo(Form,     { foreignKey: 'form_id', as: 'form' })
Section.hasMany(Question,   { foreignKey: 'section_id', as: 'questions', onDelete: 'SET NULL' })

// Question asociaciones
Question.belongsTo(Form,    { foreignKey: 'form_id',    as: 'form' })
Question.belongsTo(Section, { foreignKey: 'section_id', as: 'section' }) //  nuevo
Question.hasMany(Option,    { foreignKey: 'question_id', as: 'options', onDelete: 'CASCADE' })
Question.hasMany(Answer,    { foreignKey: 'question_id', as: 'answers', onDelete: 'CASCADE' })

// Option asociaciones
Option.belongsTo(Question, { foreignKey: 'question_id', as: 'question' })

// Invitation asociaciones
Invitation.belongsTo(Form,     { foreignKey: 'form_id',       as: 'form' })
Invitation.hasMany(Submission, { foreignKey: 'invitation_id', as: 'submissions' })

// Submission asociaciones
Submission.belongsTo(Form,       { foreignKey: 'form_id',       as: 'form' })
Submission.belongsTo(User,       { foreignKey: 'user_id',       as: 'user' })
Submission.belongsTo(Invitation, { foreignKey: 'invitation_id', as: 'invitation' })
Submission.hasMany(Answer,       { foreignKey: 'submission_id', as: 'answers', onDelete: 'CASCADE' })

// Answer asociaciones
Answer.belongsTo(Submission, { foreignKey: 'submission_id', as: 'submission' })
Answer.belongsTo(Question,   { foreignKey: 'question_id',   as: 'question' })

// NotificationSetting asociaciones
NotificationSetting.belongsTo(Form, { foreignKey: 'form_id', as: 'form' })

module.exports = {
  User,
  Campaign,
  CampaignMember,
  Form,
  Section,          //  nuevo
  Question,
  Option,
  Invitation,
  Submission,
  Answer,
  NotificationSetting
}