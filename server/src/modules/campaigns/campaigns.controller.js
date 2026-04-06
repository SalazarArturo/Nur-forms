const campaignsService = require('./campaigns.service')

const getAll = async (req, res) => {
  try {
    const campaigns = await campaignsService.getAll(req.user.id, req.user.role)
    res.status(200).json(campaigns)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const campaign = await campaignsService.getById(req.params.id, req.user.id, req.user.role)
    res.status(200).json(campaign)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const campaign = await campaignsService.create(req.body, req.user.id)
    res.status(201).json(campaign)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const update = async (req, res) => {
  try {
    const campaign = await campaignsService.update(req.params.id, req.body, req.user.id, req.user.role)
    res.status(200).json(campaign)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const remove = async (req, res) => {
  try {
    await campaignsService.remove(req.params.id, req.user.id, req.user.role)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const duplicate = async (req, res) => {
  try {
    const campaign = await campaignsService.duplicate(req.params.id, req.user.id)
    res.status(201).json(campaign)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const addMember = async (req, res) => {
  try {
    const member = await campaignsService.addMember(req.params.id, req.body, req.user.id, req.user.role)
    res.status(201).json(member)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const removeMember = async (req, res) => {
  try {
    await campaignsService.removeMember(req.params.id, req.params.memberId, req.user.id, req.user.role)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { getAll, getById, create, update, remove, duplicate, addMember, removeMember }
