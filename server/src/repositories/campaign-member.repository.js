const campaignMemberModel = require('../models/CampaignMember.js');

async function getMembership(campaignId, userId){
    return await campaignMemberModel.findOne({
        where: {campaign_id: campaignId, user_id: userId}
    });
}

module.exports = {
    getMembership
}