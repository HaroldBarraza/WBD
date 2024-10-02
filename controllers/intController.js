const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const intCont = {};

/*
  Build inventory by classification view
 */
intCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav(); 
  const className = data[0].classification_name;

  res.render("./inventory/classification", {
    title: className + " vehicles", 
    grid,
    nav,
  });
};

intCont.getInventoryDetail = async function (req, res, next) {
  const inventory_id = req.params.inventory_id;
  const data = await invModel.getInventoryDetailById(inventory_id);
  if (data) {
    res.render("./inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      vehicle: data,
    });
  } else {
    res.status(404).send("Inventory item not found");
  }
};

module.exports = intCont;
