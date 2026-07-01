jest.mock('../../src/utils/mailer')
const { sendThresholdNotification } = require('../../src/utils/mailer')

const { sequelize } = require('../../src/config/db')
const { User, Campaign, CampaignMember, Form, Submission, Question, Answer, NotificationSetting } = require('../../src/models')
const { start, submit } = require('../../src/modules/submissions/submissions.service')


beforeEach(async () => {
  await Answer.destroy({ where: {} })
  await Submission.destroy({ where: {} })
  await NotificationSetting.destroy({ where: {} })
  await Question.destroy({ where: {} })
  await Form.destroy({ where: {} })
  await CampaignMember.destroy({ where: {} })
  await Campaign.destroy({ where: {} })
  await User.destroy({ where: {} })
  sendThresholdNotification.mockClear()
})

describe('control de verificacion de tope de respuestas y gatillar un mail al creador de la campaña', () => {
  test('cuando se alcanza el threshold, se envía notificación al creador', async () => {
   
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

    
    const form = await Form.create({
      campaign_id: campaign.id,
      title: 'Encuesta threshold',
      access_type: 'public',
      status: 'published',
      created_by: owner.id
    })

    
    await NotificationSetting.create({
      form_id: form.id,
      user_id: owner.id,
      notify_on_threshold: 1,
      threshold_notified_at: null,
      notify_respondent: false
    })

    
    sendThresholdNotification.mockResolvedValue({})

    
    const submission = await start(form.id, owner.id, null, '127.0.0.1')
    await submit(submission.id, submission.respondent_token)

    
    expect(sendThresholdNotification).toHaveBeenCalledTimes(1)
    expect(sendThresholdNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@nur.edu.bo',
        count: 1
      })
    )
  })
})