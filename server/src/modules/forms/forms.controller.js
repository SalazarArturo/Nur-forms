const formsService = require('./forms.service')

const getByCampaign = async (req, res) => {
  try {
    const forms = await formsService.getByCampaign(req.params.campaignId, req.user.id, req.user.role)
    res.status(200).json(forms)
  } catch (error) {
    res.status(403).json({ message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const form = await formsService.getById(req.params.id, req.user.id, req.user.role)
    res.status(200).json(form)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getByToken = async (req, res) => {
  try {
    const form = await formsService.getByToken(req.params.id)
    res.status(200).json(form)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const form = await formsService.create(req.body, req.user.id)
    res.status(201).json(form)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const update = async (req, res) => {
  try {
    const form = await formsService.update(req.params.id, req.body, req.user.id, req.user.role)
    res.status(200).json(form)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const remove = async (req, res) => {
  try {
    await formsService.remove(req.params.id, req.user.id, req.user.role)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const duplicate = async (req, res) => {
  try {
    const form = await formsService.duplicate(req.params.id, req.user.id, req.user.role)
    res.status(201).json(form)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const publish = async (req, res) => {
  try {
    const form = await formsService.publish(req.params.id, req.user.id, req.user.role)
    res.status(200).json(form)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const close = async (req, res) => {
  try {
    const form = await formsService.close(req.params.id, req.user.id, req.user.role)
    res.status(200).json(form)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { getByCampaign, getById, getByToken, create, update, remove, duplicate, publish, close }
