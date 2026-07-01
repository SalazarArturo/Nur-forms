const { sequelize } = require('../../src/config/db')
const { Campaign, CampaignMember, User } = require('../../src/models')
const { createService } = require('../../src/modules/campaigns/campaigns.service')

beforeEach(async () => {
  await CampaignMember.destroy({ where: {} })
  await Campaign.destroy({ where: {} })
  await User.destroy({ where: {} })
})

describe('Asignacion de roles correspondientes en la creacion de una campaña', () => {
  test('al crear una campaña, el creador queda como owner en campaign_members', async () => {
    
    const user = await User.create({
      email: 'owner@nur.edu.bo',
      password_hash: 'hash123',
      full_name: 'Owner Test',
      role: 'creator'
    })

    
    await createService({
      name: 'Campaña de integración',
      description: 'Test',
      starts_at: null,
      ends_at: null
    }, user.id)

    
    const membership = await CampaignMember.findOne({
      where: { user_id: user.id, role: 'owner' }
    })

    expect(membership).not.toBeNull()
    expect(membership.role).toBe('owner')
  })
})