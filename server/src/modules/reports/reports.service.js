const { Form, Question, Option, Submission, Answer, CampaignMember } = require('../../models')
const { Op } = require('sequelize')

const checkAccess = async (formId, userId, userRole) => {
  const form = await Form.findByPk(formId)
  if (!form) throw new Error('Formulario no encontrado')
  if (userRole === 'admin') return form

  const member = await CampaignMember.findOne({
    where: { campaign_id: form.campaign_id, user_id: userId }
  })
  if (!member) throw new Error('No tenés acceso a este formulario')
  return form
}

const getSummary = async (formId, userId, userRole) => {
  const form = await checkAccess(formId, userId, userRole)

  const total        = await Submission.count({ where: { form_id: formId } })
  const completed    = await Submission.count({ where: { form_id: formId, is_complete: true } })
  const drafts       = await Submission.count({ where: { form_id: formId, is_draft: true } })
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    form_id: formId,
    form_title: form.title,
    form_status: form.status,
    total_submissions: total,
    completed_submissions: completed,
    draft_submissions: drafts,
    completion_rate: completionRate
  }
}

const getByQuestion = async (formId, userId, userRole) => {
  await checkAccess(formId, userId, userRole)

  const questions = await Question.findAll({
    where: { form_id: formId },
    include: [{ model: Option, as: 'options' }],
    order: [['position', 'ASC']]
  })

  const results = []

  for (const question of questions) {
    const answers = await Answer.findAll({
      where: { question_id: question.id },
      include: [{ model: Submission, as: 'submission', where: { is_complete: true }, attributes: [] }]
    })

    let stats = { question_id: question.id, question_text: question.text, type: question.type, total_answers: answers.length }

    if (['single_choice', 'multiple_choice'].includes(question.type)) {
      const optionCounts = {}
      for (const opt of question.options) optionCounts[opt.id] = { text: opt.text, count: 0, is_correct: opt.is_correct }

      for (const ans of answers) {
        for (const optId of ans.selected_option_ids) {
          if (optionCounts[optId]) optionCounts[optId].count++
        }
      }
      stats.options = Object.values(optionCounts)
    }

    if (question.type === 'true_false') {
      const trueCount  = answers.filter(a => a.boolean_value === true).length
      const falseCount = answers.filter(a => a.boolean_value === false).length
      stats.options = [
        { text: 'Verdadero', count: trueCount },
        { text: 'Falso',     count: falseCount }
      ]
    }

    if (['short_text', 'long_text'].includes(question.type)) {
      stats.responses = answers.map(a => a.text_value).filter(Boolean)
    }

    if (question.type === 'matching') {
      stats.matching_responses = answers.map(a => a.matching_pairs)
    }

    results.push(stats)
  }

  return results
}

const getIndividual = async (formId, userId, userRole) => {
  await checkAccess(formId, userId, userRole)

  return Submission.findAll({
    where: { form_id: formId, is_complete: true },
    include: [{
      model: Answer,
      as: 'answers',
      include: [{ model: Question, as: 'question', attributes: ['id', 'text', 'type'] }]
    }],
    order: [['submitted_at', 'DESC']]
  })
}

const exportCSV = async (formId, userId, userRole) => {
  await checkAccess(formId, userId, userRole)

  const questions = await Question.findAll({
    where: { form_id: formId },
    order: [['position', 'ASC']]
  })

  const submissions = await Submission.findAll({
    where: { form_id: formId, is_complete: true },
    include: [{ model: Answer, as: 'answers' }],
    order: [['submitted_at', 'ASC']]
  })

  const headers = ['submission_id', 'submitted_at', 'ip_address', ...questions.map(q => q.text)]
  const rows = []

  for (const sub of submissions) {
    const row = [sub.id, sub.submitted_at, sub.ip_address || '']
    for (const q of questions) {
      const ans = sub.answers.find(a => a.question_id === q.id)
      if (!ans) { row.push(''); continue }

      if (ans.text_value)                      row.push(ans.text_value)
      else if (ans.boolean_value !== null)     row.push(ans.boolean_value ? 'Verdadero' : 'Falso')
      else if (ans.selected_option_ids.length) row.push(ans.selected_option_ids.join('|'))
      else if (ans.matching_pairs.length)      row.push(JSON.stringify(ans.matching_pairs))
      else                                     row.push('')
    }
    rows.push(row)
  }

  const csvLines = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  return csvLines.join('\n')
}

const getMatchingKey = async (formId, userId, userRole) => {
  await checkAccess(formId, userId, userRole)

  const questions = await Question.findAll({
    where: { form_id: formId, type: 'matching' },
    order: [['position', 'ASC']]
  })

  return questions.map(q => ({
    question_id: q.id,
    question_text: q.text,
    pairs: q.config.pairs || []
  }))
}

module.exports = { getSummary, getByQuestion, getIndividual, exportCSV, getMatchingKey }
