const { Question, Option, Form, CampaignMember } = require('../../models')

const checkFormAccess = async (formId, userId, userRole) => {
  const form = await Form.findByPk(formId)
  if (!form) throw new Error('Formulario no encontrado')
  if (userRole === 'admin') return form

  const member = await CampaignMember.findOne({
    where: { campaign_id: form.campaign_id, user_id: userId, role: ['owner', 'editor'] }
  })
  if (!member) throw new Error('No tenés permisos sobre este formulario')
  return form
}

const getByForm = async (formId) => {
  return Question.findAll({
    where: { form_id: formId },
    include: [{ model: Option, as: 'options', order: [['position', 'ASC']] }],
    order: [['position', 'ASC']]
  })
}

const create = async (formId, data, userId, userRole) => {
  await checkFormAccess(formId, userId, userRole)

  const lastQuestion = await Question.findOne({
    where: { form_id: formId },
    order: [['position', 'DESC']]
  })
  const position = lastQuestion ? lastQuestion.position + 1 : 0

  const question = await Question.create({ ...data, form_id: formId, position })

  if (data.options && ['single_choice', 'multiple_choice', 'true_false'].includes(data.type)) {
    for (let i = 0; i < data.options.length; i++) {
      await Option.create({ question_id: question.id, ...data.options[i], position: i })
    }
  }

  return Question.findByPk(question.id, {
    include: [{ model: Option, as: 'options', order: [['position', 'ASC']] }]
  })
}

const update = async (id, data, userId, userRole) => {
  const question = await Question.findByPk(id)
  if (!question) throw new Error('Pregunta no encontrada')

  await checkFormAccess(question.form_id, userId, userRole)
  await question.update(data)

  if (data.options) {
    await Option.destroy({ where: { question_id: id } })
    for (let i = 0; i < data.options.length; i++) {
      await Option.create({ question_id: id, ...data.options[i], position: i })
    }
  }

  return Question.findByPk(id, {
    include: [{ model: Option, as: 'options', order: [['position', 'ASC']] }]
  })
}

const remove = async (id, userId, userRole) => {
  const question = await Question.findByPk(id)
  if (!question) throw new Error('Pregunta no encontrada')

  await checkFormAccess(question.form_id, userId, userRole)
  await question.destroy()
}

const reorder = async (formId, orderedIds, userId, userRole) => {
  await checkFormAccess(formId, userId, userRole)

  for (let i = 0; i < orderedIds.length; i++) {
    await Question.update({ position: i }, { where: { id: orderedIds[i], form_id: formId } })
  }

  return Question.findAll({
    where: { form_id: formId },
    include: [{ model: Option, as: 'options', order: [['position', 'ASC']] }],
    order: [['position', 'ASC']]
  })
}

module.exports = { getByForm, create, update, remove, reorder }
