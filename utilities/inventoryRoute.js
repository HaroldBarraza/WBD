const { route } = require("../routes/static");
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/intController');

router.get('/add-classification', (req, res) => {
    res.render('inventory/add-classification', {
        title: 'Agregar nueva clasificación',
        messages: req.flash('info'),
        error: req.flash('error')
    });
}); 

router.post('/add-classification', validationMiddleware, inventoryController.addClassification);

router.get("/type/:classificationId", intController.buildByClassificationId);
router.post('/add', async (req, res) => {
    try {
      const { vehicle_name, vehicle_description, make, model, year, price, miles, color, image } = req.body;
      const classification_id = req.body.classification_id;
      const result = await invModel.addInventory(vehicle_name, vehicle_description, make, model, year, price, miles, color, image, classification_id);
      res.redirect('/inventory');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al agregar el vehículo');
    }
  });
  
router.get('/inv/edit/:inv_id', intCont.editInventoryView);
module.exports = router;