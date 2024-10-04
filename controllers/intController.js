const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const intCont = {};

/*
  Build inventory by classification view
 */

intCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


intCont.getInventoryDetail = async function (req, res, next) {
  try {
    const inventory_id = req.params.inventory_id;

    const data = await invModel.getInventoryItemById(inventory_id);

    if (data) {
      const grid = await utilities.buildDetailHtml(data);

      let nav = await utilities.getNav(); 

      const title = `${data.inv_make} ${data.inv_model}`;

      res.render("./inventory/detail", {
        title,
        grid, 
        nav,
      });
    } else {
      res.status(404).send("Inventory item not found");
    }
  } catch (error) {
    next(error);
  }
};
intCont.triggerError500 = async function (req, res, next) {
  try {
    throw new Error("Error intencional de tipo 500");
  } catch (error) {
    next(error);
  }
};


module.exports = intCont;
