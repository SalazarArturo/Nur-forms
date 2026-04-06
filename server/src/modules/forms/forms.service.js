const { Form, Question, Option, CampaignMember, NotificationSetting, Submission } = require('../../models')

const checkAccess = async (formId, userId, userRole, requiredRoles = ['owner', 'editor']) => {
  const form = await Form.findByPk(formId)
  if (!form) throw new Error('Formulario no encontrado')
  if (userRole === 'admin') return form

  const member = await CampaignMember.findOne({
    where: { campaign_id: form.campaign_id, user_id: userId, role: requiredRoles }
  })
  if (!member) throw new Error('No tenés permisos sobre este formulario')
  return form
}

const getByCampaign = async (campaignId, userId, userRole) => {
  if (userRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: campaignId, user_id: userId } })
    if (!member) throw new Error('No tenés acceso a esta campaña')
  }
  return Form.findAll({
    where: { campaign_id: campaignId },
    include: [{ model: NotificationSetting, as: 'notification_settings' }]
  })
}

const getById = async (id, userId, userRole) => {
  const form = await Form.findByPk(id, {
    include: [
      {
        model: Question,
        as: 'questions',
        include: [{ model: Option, as: 'options', order: [['position', 'ASC']] }],
        order: [['position', 'ASC']]
      },
      { model: NotificationSetting, as: 'notification_settings' }
    ]
  })
  if (!form) throw new Error('Formulario no encontrado')

  if (userRole !== 'admin' && form.access_type === 'private') {
    const member = await CampaignMember.findOne({ where: { campaign_id: form.campaign_id, user_id: userId } })
    if (!member) throw new Error('No tenés acceso a este formulario')
  }
  return form
}

const getByToken = async (token) => {
  const form = await Form.findOne({
    where: { id: token },
    include: [{
      model: Question,
      as: 'questions',
      include: [{ model: Option, as: 'options', order: [['position', 'ASC']] }],
      order: [['position', 'ASC']]
    }]
  })
  if (!form) throw new Error('Formulario no encontrado')
  if (form.status !== 'published') throw new Error('Este formulario no está disponible')

  const now = new Date()
  if (form.opens_at && now < form.opens_at) throw new Error('Este formulario aún no está abierto')
  if (form.closes_at && now > form.closes_at) throw new Error('Este formulario ya cerró')

  return form
}

const create = async (data, userId) => {
  const form = await Form.create({ ...data, created_by: userId })
  if (data.notification_settings) {
    await NotificationSetting.create({ form_id: form.id, ...data.notification_settings })
  }
  return form
}

const update = async (id, data, userId, userRole) => {
  const form = await checkAccess(id, userId, userRole)
  await form.update(data)

  if (data.notification_settings) {
    await NotificationSetting.upsert({ form_id: id, ...data.notification_settings })
  }
  return form
}

const remove = async (id, userId, userRole) => {
  const form = await checkAccess(id, userId, userRole)
  await form.destroy()
}

const duplicate = async (id, userId, userRole) => {
  const original = await checkAccess(id, userId, userRole, ['owner', 'editor'])
  const originalFull = await Form.findByPk(id, {
    include: [{ model: Question, as: 'questions', include: [{ model: Option, as: 'options' }] }]
  })

  const copy = await Form.create({
    campaign_id: originalFull.campaign_id,
    created_by: userId,
    title: `${originalFull.title} (copia)`,
    description: originalFull.description,
    primary_color: originalFull.primary_color,
    access_type: originalFull.access_type,
    anonymous_mode: originalFull.anonymous_mode,
    shuffle_questions: originalFull.shuffle_questions,
    show_progress_bar: originalFull.show_progress_bar,
    paginate_sections: originalFull.paginate_sections,
    welcome_message: originalFull.welcome_message,
    thank_you_message: originalFull.thank_you_message,
    status: 'draft'
  })

  for (const q of originalFull.questions) {
    const newQ = await Question.create({
      form_id: copy.id, type: q.type, text: q.text,
      help_text: q.help_text, is_required: q.is_required,
      position: q.position, config: q.config
    })
    for (const o of q.options) {
      await Option.create({ question_id: newQ.id, text: o.text, is_correct: o.is_correct, position: o.position })
    }
  }
  return copy
}

const publish = async (id, userId, userRole) => {
  const form = await checkAccess(id, userId, userRole)
  await form.update({ status: 'published' })
  return form
}

const close = async (id, userId, userRole) => {
  const form = await checkAccess(id, userId, userRole)
  await form.update({ status: 'closed' })
  return form
}

module.exports = { getByCampaign, getById, getByToken, create, update, remove, duplicate, publish, close }
