/*const {getUserCampaignsService, createCampaignService} = require('./user.service.js');

async function getMyCampaigns(req, res, next){
    const {id} = req.user;

    try {
        const result = await getUserCampaignsService(id);
        return res.status(200).json({campaigns: result});
    } catch (error) {
       return next(error);
    }
}

async function createCampaign(req, res, next){

    const {id} = req.user;
    
    try {

        const result = await createCampaignService(req.body, id);
        return res.status(201).json(result);

    } catch (error) {
        if(error.message === 'Nombre de campaha es obligatorio' ||
            error.message === 'Formato de fecha invalido' || 
            error.message === 'Fecha de inicio no puede ser pasada a fecha actual' ||
            error.message === 'La fecha de finalizacion no puede ser pasada a la fecha actual' ||
            error.message === 'La fecha de finalizacion no puede ser pasada a la fecha de inicio'
        ){
            return res.status(400).json({message: error.message});
        }
        return next(error);
    }
}
module.exports = {
    getMyCampaigns,
    createCampaign
}
mas de lo mismo xdd     

*/