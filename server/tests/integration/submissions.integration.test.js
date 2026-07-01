const { sequelize } = require('../../src/config/db')
const { User, Campaign, CampaignMember, Form, Invitation, Submission, Question, Answer } = require('../../src/models')

beforeEach(async () => {
  await Answer.destroy({ where: {} })
  await Submission.destroy({ where: {} })
  await Invitation.destroy({ where: {} })
  await Question.destroy({ where: {} })
  await Form.destroy({ where: {} })
  await CampaignMember.destroy({ where: {} })
  await Campaign.destroy({ where: {} })
  await User.destroy({ where: {} })
})

const { create: createInvitation, validate: validateInvitation } = require('../../src/modules/invitations/invitations.service')
const { start, submit } = require('../../src/modules/submissions/submissions.service')

describe('Form privado a invitación a submission', () => {
  test('un respondente puede iniciar y completar un formulario privado con token válido', async () => {
    
    const owner = await User.create({
      email: 'owner@nur.edu.bo',
      password_hash: 'hash123',
      full_name: 'Owner Test',
      role: 'creator'
    })

    
    const campaign = await Campaign.create({
      name: 'Campaña Test',
      description: 'Test',
      created_by: owner.id
    })
    await CampaignMember.create({
      campaign_id: campaign.id,
      user_id: owner.id,
      role: 'owner'
    })

    
    const form = await Form.create({
      campaign_id: campaign.id,
      title: 'Encuesta privada',
      access_type: 'private',
      status: 'published',
      created_by: owner.id
    })

    
    const results = await createInvitation(form.id, ['respondente@nur.edu.bo'], owner.id, 'creator', 'http://localhost:3000')
    expect(results[0].status).toBe('email_failed') 
    
    
    const invitation = await Invitation.findOne({ where: { form_id: form.id } })
    expect(invitation).not.toBeNull()

    
    const validation = await validateInvitation(form.id, invitation.token)
    expect(validation.valid).toBe(true)

    
    const submission = await start(form.id, null, invitation.token, '127.0.0.1')
    expect(submission).not.toBeNull()
    expect(submission.is_draft).toBe(true)

    
    await submit(submission.id, submission.respondent_token)
    const completed = await Submission.findByPk(submission.id)
    expect(completed.is_complete).toBe(true)
    expect(completed.is_draft).toBe(false)
  })
})