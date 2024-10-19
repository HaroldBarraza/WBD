const express = require("express");
const router = new express.Router();
const intController = require("../controllers/intController");
const utilities = require('../utilities/index');
const { check, validationResult } = require('express-validator');
const { checkAdminEmployee } = require("../middleware/authMiddleware");
const regValidate = require('../utilities/account-validation')

// Route to get inventory by classification
router.get("/type/:classificationId", intController.buildByClassificationId);

// Route to get details of a specific inventory item
router.get("/detail/:inventory_id", intController.getInventoryDetail);

// Route to trigger error 500 intentionally
router.get("/error-500", intController.triggerError500);

// Middleware to handle 500 errors
router.use(utilities.errorHandler500);

// Route to show the inventory management interface
router.get('/', intController.showManagement);

// Routes for adding a classification
router.get('/add-classification', intController.showAddClassification);
router.post('/add-classification', intController.addClassification);

// Route to show the add inventory form
router.get('/add-inventory', intController.showAddInventory);

// Route to handle form submission for adding inventory with validation
router.post('/add-inventory', [
  check('vehicle_name')
    .isLength({ min: 3, max: 50 })
    .withMessage('Vehicle name must be between 3 and 50 characters'),
  check('vehicle_description')
    .isLength({ min: 10, max: 200 })
    .withMessage('Vehicle description must be between 10 and 200 characters'),
  check('make')
    .isLength({ min: 3, max: 50 })
    .withMessage('Vehicle make must be between 3 and 50 characters'),
  check('model')
    .isLength({ min: 3, max: 50 })
    .withMessage('Vehicle model must be between 3 and 50 characters'),
  check('year')
    .isNumeric()
    .withMessage('Vehicle year must be a number'),
  check('price')
    .isNumeric()
    .withMessage('Vehicle price must be a number'),
  check('miles')
    .isNumeric()
    .withMessage('Vehicle mileage must be a number'),
  check('color')
    .isLength({ min: 3, max: 50 })
    .withMessage('Vehicle color must be between 3 and 50 characters'),
  check('classification_id')
    .isNumeric()
    .withMessage('Vehicle classification must be a number'),
], intController.addInventory);

router.get('/getInventory/:classification_id', utilities.handleError(intController.getInventoryJSON));

router.get('/edit/:inventory_id', intController.getEditInventoryItem);

// Manejo de errores en la ruta
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Ocurrió un error al cargar la página de edición.');
});

router.get('/inv/edit/:inv_id', intController .editInventoryView);


// Rutas públicas (no requieren autenticación)
router.get("/type/:classificationId", utilities.handleError(intController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleError(intController.buildByInventoryId));

// Rutas administrativas (requieren autenticación y privilegios)
router.get("/", checkAdminEmployee, utilities.handleError(intController.buildManagement));
router.get("/add-classification", checkAdminEmployee, utilities.handleError(intController.buildAddClassification));
router.post("/add-classification", checkAdminEmployee, utilities.handleError(intController.addClassification));
router.post("/add-inventory", checkAdminEmployee, utilities.handleError(intController.addInventory));
router.get("/getInventory/:classification_id", checkAdminEmployee, utilities.handleError(intController.getInventoryJSON));
router.get("/edit/:invId", checkAdminEmployee, utilities.handleError(intController.buildEditInventory));
router.post("/update/", checkAdminEmployee, utilities.handleError(intController.updateInventory));
router.get("/delete/:invId", checkAdminEmployee, utilities.handleError(intController.buildDeleteInventory));
router.post("/delete", checkAdminEmployee, utilities.handleError(intController.deleteInventory));

router.get("/", utilities.checkLogin, utilities.handleError(intController.buildAccountManagement))
router.get("/update/:accountId", utilities.checkLogin, utilities.handleError(intController.buildAccountUpdate))
router.post("/update", utilities.checkLogin, regValidate.registationRules(), regValidate.checkRegData, utilities.handleError(intController.updateAccount))


module.exports = router; 
  