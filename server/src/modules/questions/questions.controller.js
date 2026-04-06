const questionsService = require('./questions.service')

const getByForm = async (req, res) => {
  try {
    const questions = await questionsService.getByForm(req.params.formId)
    res.status(200).json(questions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const question = await questionsService.create(req.params.formId, req.body, req.user.id, req.user.role)
    res.status(201).json(question)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const update = async (req, res) => {
  try {
    const question = await questionsService.update(req.params.id, req.body, req.user.id, req.user.role)
    res.status(200).json(question)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const remove = async (req, res) => {
  try {
    await questionsService.remove(req.params.id, req.user.id, req.user.role)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const reorder = async (req, res) => {
  try {
    const questions = await questionsService.reorder(req.params.formId, req.body.orderedIds, req.user.id, req.user.role)
    res.status(200).json(questions)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { getByForm, create, update, remove, reorder }
