const express = require("express");
const router = new express.Router();
const intController = require("../controllers/intController");

router.get("/type/:classificationId", intController.buildByClassificationId);
router.get("/detail/:inventory_id", intController.getInventoryDetail);

module.exports = router;
