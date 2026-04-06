const { Campaign, CampaignMember, User, Form } = require('../../models')

const getAll = async (userId, userRole) => {
  if (userRole === 'admin') {
    return Campaign.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] }]
    })
  }
  const memberships = await CampaignMember.findAll({ where: { user_id: userId } })
  const campaignIds = memberships.map(m => m.campaign_id)
  return Campaign.findAll({
    where: { id: campaignIds },
    include: [{ model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] }]
  })
}

const getById = async (id, userId, userRole) => {
  const campaign = await Campaign.findByPk(id, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
      { model: Form, as: 'forms', attributes: ['id', 'title', 'status', 'access_type', 'created_at'] },
      { model: CampaignMember, as: 'members', include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }] }
    ]
  })
  if (!campaign) throw new Error('Campaña no encontrada')

  if (userRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: id, user_id: userId } })
    if (!member) throw new Error('No tenés acceso a esta campaña')
  }
  return campaign
}

const create = async ({ name, description, starts_at, ends_at }, userId) => {
  const campaign = await Campaign.create({ name, description, starts_at, ends_at, created_by: userId })
  await CampaignMember.create({ campaign_id: campaign.id, user_id: userId, role: 'owner' })
  return campaign
}

const update = async (id, data, userId, userRole) => {
  const campaign = await Campaign.findByPk(id)
  if (!campaign) throw new Error('Campaña no encontrada')

  if (userRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: id, user_id: userId, role: ['owner', 'editor'] } })
    if (!member) throw new Error('No tenés permisos para editar esta campaña')
  }

  await campaign.update(data)
  return campaign
}

const remove = async (id, userId, userRole) => {
  const campaign = await Campaign.findByPk(id)
  if (!campaign) throw new Error('Campaña no encontrada')

  if (userRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: id, user_id: userId, role: 'owner' } })
    if (!member) throw new Error('Solo el dueño puede eliminar esta campaña')
  }

  await campaign.destroy()
}

const duplicate = async (id, userId) => {
  const original = await Campaign.findByPk(id, { include: [{ model: Form, as: 'forms' }] })
  if (!original) throw new Error('Campaña no encontrada')

  const copy = await Campaign.create({
    name: `${original.name} (copia)`,
    description: original.description,
    status: 'draft',
    created_by: userId
  })
  await CampaignMember.create({ campaign_id: copy.id, user_id: userId, role: 'owner' })
  return copy
}

const addMember = async (campaignId, { user_id, role }, requesterId, requesterRole) => {
  const campaign = await Campaign.findByPk(campaignId)
  if (!campaign) throw new Error('Campaña no encontrada')

  if (requesterRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: campaignId, user_id: requesterId, role: 'owner' } })
    if (!member) throw new Error('Solo el dueño puede agregar miembros')
  }

  const existing = await CampaignMember.findOne({ where: { campaign_id: campaignId, user_id } })
  if (existing) throw new Error('El usuario ya es miembro de esta campaña')

  return CampaignMember.create({ campaign_id: campaignId, user_id, role: role || 'viewer' })
}

const removeMember = async (campaignId, memberId, requesterId, requesterRole) => {
  if (requesterRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: campaignId, user_id: requesterId, role: 'owner' } })
    if (!member) throw new Error('Solo el dueño puede eliminar miembros')
  }
  await CampaignMember.destroy({ where: { id: memberId } })
}

module.exports = { getAll, getById, create, update, remove, duplicate, addMember, removeMember }
