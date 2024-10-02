const express = require("express");
const router = new express.Router();
const invController = require("../controllers/intController");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inventory_id", invController.getInventoryDetail); // Corregido typo de invetory_id a inventory_id

module.exports = router;
