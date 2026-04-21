/*const {getAllUserCampaigns, createCampaign} = require('../../repositories/campaign-repository.js');

async function getUserCampaignsService(userId){
    try {
        const campaigns = await getAllUserCampaigns(userId);
        return campaigns;
    } catch (error) {
        throw error;
    }
}

async function createCampaignService(campaignData, ownerId){
   // const { name, description, starts_at, ends_at } = req.body;

   if(campaignData.name.trim() == ''){
    throw new Error('Nombre de campaha es obligatorio');
   }

   if(campaignData.starts_at && campaignData.ends_at){

        const currentTime = new Date();
        const startCampaign = new Date(campaignData.starts_at);
        const endCampaign = new Date(campaignData.ends_at);

        if(isNaN(startCampaign.getTime()) || isNaN(endCampaign.getTime())){
            throw new Error('Formato de fecha invalido');
        }

        if(startCampaign < currentTime) throw new Error('Fecha de inicio no puede ser pasada a fecha actual');
        if(endCampaign < currentTime) throw new Error('La fecha de finalizacion no puede ser pasada a la fecha actual');
        if(endCampaign < startCampaign) throw new Error('La fecha de finalizacion no puede ser pasada a la fecha de inicio');

    }else{
        campaignData.starts_at = null;
        campaignData.ends_at = null;
    }

    try {
        const result = await createCampaign({
            name: campaignData.name,
            description: campaignData.description?? 'Sin descripcion',
            starts_at: campaignData.starts_at,
            ends_at: campaignData.ends_at
        }, ownerId);

        return {
            message: 'Campaha creada exitosamente'
        }

    } catch (error) {
        throw error;
    }
   
   

   
}
module.exports = {
    getUserCampaignsService,
    createCampaignService
}
    
    mas de lo mismo .... 
*/
