const express = require("express");
const router = new express.Router();
const intController = require("../controllers/intController");
const utilities = require('../utilities/index');

router.get("/type/:classificationId", intController.buildByClassificationId);
router.get("/detail/:inventory_id", intController.getInventoryDetail);

router.get("/error-500", intController.triggerError500);

router.use(utilities.errorHandler500);

module.exports = router;
