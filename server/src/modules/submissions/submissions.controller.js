const submissionsService = require('./submissions.service')

const start = async (req, res) => {
  try {
    const { invitationToken } = req.body
    const userId = req.user?.id || null
    const ip = req.ip
    const submission = await submissionsService.start(req.params.formId, userId, invitationToken, ip)
    res.status(201).json(submission)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const saveAnswers = async (req, res) => {
  try {
    const { answers, respondentToken } = req.body
    const submission = await submissionsService.saveAnswers(req.params.id, answers, respondentToken)
    res.status(200).json(submission)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const submit = async (req, res) => {
  try {
    const { respondentToken } = req.body
    const submission = await submissionsService.submit(req.params.id, respondentToken)
    res.status(200).json(submission)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getByForm = async (req, res) => {
  try {
    const submissions = await submissionsService.getByForm(req.params.formId, req.user.id, req.user.role)
    res.status(200).json(submissions)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getByToken = async (req, res) => {
  try {
    const submission = await submissionsService.getByToken(req.params.token)
    res.status(200).json(submission)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

module.exports = { start, saveAnswers, submit, getByForm, getByToken }
