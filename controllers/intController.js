const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const { validationResult } = require('express-validator');

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

// Función para mostrar la vista de gestión
intCont.showManagement = async function (req, res) {
  try {
      const nav = await utilities.getNav(); // Obtener la navegación
      const classificationSelect = await utilities.buildClassificationList(); // Construir lista de clasificaciones
      console.log('classificationSelect:', classificationSelect); // Verifica la lista de clasificaciones

      res.render('./inventory/management', {
          title: 'Management',
          nav, // Pasar la variable nav
          classificationSelect, // Agregar la lista de clasificaciones como un arreglo
          messages: req.flash('info')
      });
  } catch (error) {
      console.error("Error fetching nav:", error);
      res.status(500).send("Internal Server Error"); // Manejo básico de errores
  }
};







// Asegúrate de tener funciones similares para otras vistas
intCont.showAddClassification = async function (req, res) {
    try {
        const nav = await utilities.getNav(); // Obtener la navegación
        res.render('./inventory/add-classification', {
            title: 'Add Classification',
            nav, // Pasar la variable nav
            messages: req.flash('info')
        });
    } catch (error) {
        console.error("Error fetching nav:", error);
        res.status(500).send("Internal Server Error");
    }
};


// intController.js
// Función para agregar inventario
// Función para agregar inventario
intCont.addInventory = async function (req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('inventory/add-inventory', {
        title: 'Agregar inventario',
        errors: errors.array()
      });
    }

    const make = req.body.make;
    const model = req.body.model;
    const year = req.body.year;
    const description = req.body.vehicle_description;
    const image = req.file;
    const thumbnail = req.file;
    const price = req.body.price;
    const miles = req.body.miles;
    const color = req.body.color;
    const classificationId = req.body.classification_id;

    // Validación
    if (!make || !model || !year || !description || !image || !thumbnail || !price || !miles || !color || !classificationId) {
      throw new Error('Faltan parámetros');
    }

    // Se llama a la función del modelo para agregar el vehículo
    const result = await invModel.addInventory(make, model, year, description, image, thumbnail, price, miles, color, classificationId);
    if (result) {
      req.flash('success', 'Vehículo agregado correctamente');
      res.redirect('/inv/add-inventory');
    } else {
      req.flash('error', 'Error al agregar vehículo');
      res.render('inventory/addInventory', { errors: req.flash('error'), locals: req.body });
    }
  } catch (error) {
    req.flash('error', 'Error al agregar vehículo');
    res.render('inventory/addInventory', { errors: req.flash('error'), locals: req.body });
  }
};

intCont.showAddInventoryForm = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('inventory/add-inventory', {
      title: 'Agregar inventario',
      errors: errors.array()
    });
  } else {
    res.render('inventory/add-inventory', {
      title: 'Agregar inventario',
      errors: []
    });
  }
};





intCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav();
  res.render('inventory/add-classification', {
      title: 'Add New Classification',
      nav,
      message: req.flash('notice'), // Mensaje flash directo desde req.flash
      errors: null
  });
}

// Handle the form submission for adding a classification
intCont.addClassification = async function (req, res) {
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
      return res.render('inventory/add-classification', {
          title: 'Add New Classification',
          nav,
          message: 'Please fix the following errors:',
          errors: errors.array() // Envía los errores al renderizar la vista
      });
  }

  const { classification_name } = req.body;

  try {
      const regResult = await invModel.registerClassification(classification_name);
      if (regResult) {
          nav = await utilities.getNav();  // Update navigation to show new classification
          req.flash('notice', `Successfully added classification ${classification_name}`);
          res.status(201).redirect('/inventory/management'); // Redirige a la vista de gestión
      } else {
          req.flash('notice', 'Sorry, the insertion failed.');
          res.status(501).render('inventory/add-classification', {
              title: 'Add New Classification',
              nav,
              message: req.flash('notice'),
              errors: null
          });
      }
  } catch (error) {
      console.log(error);
      req.flash('notice', 'There was an error processing your request. Please try again later.');
      res.status(500).render('inventory/add-classification', {
          title: 'Add New Classification',
          nav,
          message: req.flash('notice'),
          errors: null
      });
  }
}

intCont.showAddInventory = async (req, res) => {
  try {
    const classificationList = await utilities.buildClassificationList();
    console.log('classificationList:', classificationList); // Agrega esta línea para verificar si se está pasando correctamente
    const nav = await utilities.getNav();
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList: classificationList, // Asegúrate de que estás pasando la variable classificationList a la vista
      flash: req.flash(),
      errors: [],
      vehicle_name: ''
    });
  } catch (error) {
    console.error('Error obteniendo la lista de clasificaciones:', error);
    req.flash('message', 'Error loading classifications');
  }
};

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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
intCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = intCont;
