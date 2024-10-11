const pool = require("../database/");

/******************************
 * GET all classification data
 *********************************/
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory WHERE classification_id = $1`,
            [classification_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByClassificationId error: " + error);
        throw error;
    }
}

async function getClassificationListFromDB() {
  try {
      const classifications = await getClassifications();
      console.log("getClassificationListFromDB:", classifications.rows); // Agrega esta línea
      return classifications.rows;
  } catch (err) {
      console.error(err);
      return [];
  }
}


async function getInventoryItemById(invId) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.inv_id = $1`,
        [invId]
      );
      return data.rows[0];
    } catch (error) {
      console.error("getInventoryItemById error " + error);
    }
  }

async function getVehicleById(inventory_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory WHERE inv_id = $1`,
            [inventory_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getVehicleById error: " + error);
        throw error;
    }
}

async function registerClassification(classification_name) {
    try {
      const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
      return await pool.query(sql, [classification_name]);
    } catch (error) {
      return error.message;
    }
  }

  async function addInventory(make, model, year, description, image, thumbnail, price, miles, color, classificationId) {
    try {
      const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *";
      const result = await pool.query(sql, [make, model, year, description, image, thumbnail, price, miles, color, classificationId]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
   }
  }
  




module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryItemById,
    getVehicleById,
    registerClassification,
    getClassificationListFromDB,
    addInventory
  };
