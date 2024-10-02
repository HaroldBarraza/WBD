const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

invCont.getInventoryDetail = async function (req, res, next) {
  const inventory_id = req.params.inventory_id;
  const vehicleData = await invModel.getVehicleById(inventory_id); // Obtener los datos del vehículo
  let nav = await utilities.getNav();

  if (vehicleData.length > 0) {
    const vehicle = vehicleData[0];
    const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle); // Utilizar la función de utilidades para generar el HTML

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`, // Título con marca y modelo
      vehicleHTML, 
      nav,
    });
  } else {
    next({ status: 404, message: "Vehicle not found" });
  }
};

module.exports = invCont;

