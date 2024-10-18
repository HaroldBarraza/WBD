const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const { validationResult } = require('express-validator');
const pool = require("../database/");

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
    nav,
    grid,
  });
}

// Función para mostrar la vista de gestión
intCont.showManagement = async function (req, res) {
  try {
    const nav = await utilities.getNav(); // Obtener la navegación
    const classificationSelect = await utilities.buildClassificationList(); // Construir lista de clasificaciones

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

intCont.getEditInventoryItem = async (req, res, next) => {
  try {
      const inventory_id = req.params.inventory_id;
      const inventoryItem = await invModel.getInventoryItemById(inventory_id);

      if (!inventoryItem) {
          return res.status(404).send('El elemento del inventario no fue encontrado');
      }

      // Desestructuramos las propiedades necesarias
      const {
          inv_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color,
          classification_id,
          classification_name
      } = inventoryItem;

      res.render('inventory/edit-inventory', { 
          title: 'Editar Vehículo',
          inv_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color,
          classification_id,
          classification_name,
          nav: await utilities.getNav() // Asegúrate de pasar la navegación también
      });
  } catch (error) { 
      next(error);
  }
}

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

    const { make, model, year, vehicle_description, price, miles, color, classification_id } = req.body;
    const image = req.file;
    const thumbnail = req.file;

    // Validación
    if (!make || !model || !year || !vehicle_description || !image || !thumbnail || !price || !miles || !color || !classification_id) {
      throw new Error('Faltan parámetros');
    }

    // Se llama a la función del modelo para agregar el vehículo
    const result = await invModel.addInventory(make, model, year, vehicle_description, image, thumbnail, price, miles, color, classification_id);
    if (result) {
      req.flash('success', 'Vehículo agregado correctamente');
      res.redirect('/inv/add-inventory');
    } else {
      req.flash('error', 'Error al agregar vehículo');
      res.render('inventory/add-inventory', { errors: req.flash('error'), locals: req.body });
    }
  } catch (error) {
    req.flash('error', 'Error al agregar vehículo');
    res.render('inventory/add-inventory', { errors: req.flash('error'), locals: req.body });
  }
};

intCont.showAddInventoryForm = (req, res) => {
  const errors = validationResult(req);
  res.render('inventory/add-inventory', {
    title: 'Agregar inventario',
    errors: errors.isEmpty() ? [] : errors.array()
  });
};

intCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav();
  res.render('inventory/add-classification', {
    title: 'Add New Classification',
    nav,
    message: req.flash('notice'),
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
      errors: errors.array()
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
    const nav = await utilities.getNav();
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList, // Asegúrate de que estás pasando la variable classificationList a la vista
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
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData[0]?.inv_id) { // Verifica si existe inv_id
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
}  

/* ***************************
 *  Build edit inventory view
 * ************************** */
 
intCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryItemById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


intCont.editInventoryView = async (req, res) => {
  const inv_id = req.params.inv_id; // Obtén el inv_id desde los parámetros de la URL

  try {
      // Ejecuta la consulta para obtener los datos del inventario
      const result = await pool.query(`
          SELECT i.*, c.classification_name
          FROM public.inventory AS i
          JOIN public.classification AS c
          ON i.classification_id = c.classification_id
          WHERE i.inv_id = $1;`, [inv_id]);

      // Verifica el resultado de la consulta
      console.log('Query Result:', result.rows); // Esto debería mostrar los datos obtenidos

      // Asegúrate de que obtuviste un resultado
      if (result.rows.length > 0) {
          const inventoryItem = result.rows[0]; // Obtén el primer item

          // Log adicional para verificar los datos pasados
          console.log('Passing to view:', {
              title: 'Edit Inventory',
              inv_id: inventoryItem.inv_id,
              inv_make: inventoryItem.inv_make,
              inv_model: inventoryItem.inv_model,
              inv_year: inventoryItem.inv_year,
              inv_description: inventoryItem.inv_description,
              inv_image: inventoryItem.inv_image,
              inv_thumbnail: inventoryItem.inv_thumbnail,
              inv_price: inventoryItem.inv_price,
              inv_mile: inventoryItem.inv_mile,
              inv_color: inventoryItem.inv_color,
              classification_name: inventoryItem.classification_name,
          });

          // Renderiza la vista pasando el inv_id y otros datos
          res.render('inventory/edit-inventory', {
              title: 'Edit Inventory',
              inv_id: inventoryItem.inv_id,
              inv_make: inventoryItem.inv_make,
              inv_model: inventoryItem.inv_model,
              inv_year: inventoryItem.inv_year,
              inv_description: inventoryItem.inv_description,
              inv_image: inventoryItem.inv_image,
              inv_thumbnail: inventoryItem.inv_thumbnail,
              inv_price: inventoryItem.inv_price,
              inv_mile: inventoryItem.inv_mile,
              inv_color: inventoryItem.inv_color,
              classification_name: inventoryItem.classification_name,
          });
      } else {
          // Manejo de error si no se encuentra el inventario
          res.status(404).send('Inventory item not found');
      }
  } catch (error) {
      console.error('Error fetching inventory item:', error);
      res.status(500).send('Internal Server Error');
  }
}; 






// Exporta el controlador
module.exports = intCont;
