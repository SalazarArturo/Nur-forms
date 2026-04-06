const { Submission, Answer, Form, Invitation, Question, NotificationSetting, User } = require('../../models')
const { sendThresholdNotification, sendSubmissionConfirmation } = require('../../utils/mailer')

const start = async (formId, userId, invitationToken, ipAddress) => {
  const form = await Form.findByPk(formId)
  if (!form) throw new Error('Formulario no encontrado')
  if (form.status !== 'published') throw new Error('Este formulario no está disponible')

  const now = new Date()
  if (form.opens_at && now < form.opens_at) throw new Error('Este formulario aún no está abierto')
  if (form.closes_at && now > form.closes_at) throw new Error('Este formulario ya cerró')

  let invitationId = null
  if (form.access_type === 'private') {
    if (!invitationToken) throw new Error('Se requiere token de invitación')
    const invitation = await Invitation.findOne({ where: { form_id: formId, token: invitationToken } })
    if (!invitation) throw new Error('Token de invitación inválido')
    if (invitation.status === 'submitted') throw new Error('Esta invitación ya fue usada')
    invitationId = invitation.id
    await invitation.update({ status: 'opened' })
  }

  if (form.max_responses_per_user === 1 && userId) {
    const existing = await Submission.findOne({ where: { form_id: formId, user_id: userId, is_complete: true } })
    if (existing) throw new Error('Ya respondiste este formulario')
  }

  const draft = await Submission.findOne({ where: { form_id: formId, user_id: userId || null, is_draft: true } })
  if (draft) return draft

  return Submission.create({
    form_id: formId,
    user_id: form.anonymous_mode ? null : userId,
    invitation_id: invitationId,
    ip_address: ipAddress,
    is_draft: true
  })
}

const saveAnswers = async (submissionId, answers, respondentToken) => {
  const submission = await Submission.findOne({ where: { id: submissionId, respondent_token: respondentToken } })
  if (!submission) throw new Error('Envío no encontrado')
  if (submission.is_complete) throw new Error('Este envío ya fue completado')

  for (const ans of answers) {
    await Answer.upsert({
      submission_id: submissionId,
      question_id: ans.question_id,
      text_value: ans.text_value || null,
      boolean_value: ans.boolean_value ?? null,
      selected_option_ids: ans.selected_option_ids || [],
      matching_pairs: ans.matching_pairs || []
    })
  }

  return submission
}

const submit = async (submissionId, respondentToken) => {
  const submission = await Submission.findOne({
    where: { id: submissionId, respondent_token: respondentToken },
    include: [{ model: Form, as: 'form', include: [{ model: NotificationSetting, as: 'notification_settings' }] }]
  })
  if (!submission) throw new Error('Envío no encontrado')
  if (submission.is_complete) throw new Error('Este envío ya fue completado')

  const form = submission.form
  const questions = await Question.findAll({ where: { form_id: form.id, is_required: true } })
  const answers = await Answer.findAll({ where: { submission_id: submissionId } })
  const answeredIds = answers.map(a => a.question_id)

  for (const q of questions) {
    if (!answeredIds.includes(q.id)) throw new Error(`La pregunta "${q.text}" es obligatoria`)
  }

  await submission.update({ is_complete: true, is_draft: false, submitted_at: new Date() })

  if (submission.invitation_id) {
    await Invitation.update({ status: 'submitted' }, { where: { id: submission.invitation_id } })
  }

  const settings = form.notification_settings
  if (settings) {
    const count = await Submission.count({ where: { form_id: form.id, is_complete: true } })

    if (settings.notify_on_threshold && count === settings.notify_on_threshold && !settings.threshold_notified_at) {
      const creator = await User.findByPk(form.created_by)
      if (creator) {
        await sendThresholdNotification({ to: creator.email, formTitle: form.title, count })
        await settings.update({ threshold_notified_at: new Date() })
      }
    }

    if (settings.notify_respondent && submission.respondent_email) {
      await sendSubmissionConfirmation({ to: submission.respondent_email, formTitle: form.title })
    }
  }

  return submission
}

const getByForm = async (formId, userId, userRole) => {
  const form = await Form.findByPk(formId)
  if (!form) throw new Error('Formulario no encontrado')

  return Submission.findAll({
    where: { form_id: formId, is_complete: true },
    include: [
      { model: Answer, as: 'answers' },
      { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }
    ]
  })
}

const getByToken = async (token) => {
  const submission = await Submission.findOne({
    where: { respondent_token: token },
    include: [{ model: Answer, as: 'answers' }]
  })
  if (!submission) throw new Error('Envío no encontrado')
  return submission
}

module.exports = { start, saveAnswers, submit, getByForm, getByToken }
