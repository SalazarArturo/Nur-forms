const invitationsService = require('./invitations.service')

const getByForm = async (req, res) => {
  try {
    const invitations = await invitationsService.getByForm(req.params.formId, req.user.id, req.user.role)
    res.status(200).json(invitations)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const { emails } = req.body
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const results = await invitationsService.create(req.params.formId, emails, req.user.id, req.user.role, baseUrl)
    res.status(201).json(results)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const remove = async (req, res) => {
  try {
    await invitationsService.remove(req.params.id, req.user.id, req.user.role)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const validate = async (req, res) => {
  try {
    const result = await invitationsService.validate(req.params.formId, req.query.token)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { getByForm, create, remove, validate }
