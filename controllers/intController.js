const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const intCont = {};

/*
  Build inventory by classification view
 */
// ...

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

// ...

intCont.getInventoryDetail = async function (req, res, next) {
  try {
    const inventory_id = req.params.inventory_id;

    // Obtener los datos del vehículo por su ID
    const data = await invModel.getInventoryItemById(inventory_id);

    if (data) {
      // Generar el HTML del detalle del vehículo
      const grid = await utilities.buildDetailHtml(data);

      // Obtener la barra de navegación (similar a buildByClassificationId)
      let nav = await utilities.getNav(); 

      // Obtener el nombre completo del vehículo (marca y modelo)
      const title = `${data.inv_make} ${data.inv_model}`;

      // Renderizar la vista con los datos del vehículo y la navegación
      res.render("./inventory/detail", {
        title,
        grid,  // HTML generado con los detalles del vehículo
        nav,   // Barra de navegación
      });
    } else {
      res.status(404).send("Inventory item not found");
    }
  } catch (error) {
    next(error);
  }
};


module.exports = intCont;
