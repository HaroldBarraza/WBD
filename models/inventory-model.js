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

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryItemById,
    getVehicleById
  };
