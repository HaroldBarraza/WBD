const commentModel = require('../models/coomment-model');

async function addComment(req, res) {
    const {vehicleId,  commentText} = req.body;
    const  userId = req.session.accountData.account_id;

    if (!commentText || commentText.length < 1 || commentText.length > 250){
        req.flash('error',  'Comment must be between 1 and 250 characters.');
        return  res.redirect(`/inv/detail/${vehicleId}`);
    }
    try{
        await commentModel.addComment(vehicleId,  userId, commentText);
        req.flash ('success', 'Comment added successfully.');
        res.redirect (`/inv/detail/${vehicleId}`)
    }
    catch (error){
        console.error('error to  add comment:', error);
        req.flash  ('error', 'Error adding comment.');
        res.redirect  (`/inv/detail/${vehicleId}`)


    }


}

async function getComments(req, res, next) {
    const vehicleId = req.params.inventory_id; // Asegúrate de que este sea el ID correcto

    try {
        const comments = await commentModel.getCommentsByVehicleId(vehicleId);
        console.log('Comments fetched:', comments); // Agrega un log para verificar los comentarios
        res.locals.comments = comments; // Pasar los comentarios a la vista
        next();
    } catch (error) {
        console.error('Error fetching comments:', error);
        next(error);
    }
}

module.exports = { addComment, getComments };