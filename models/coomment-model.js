const pool = require("../database/");

async function addComment(vehivleId, userId, commentText) {
    const query = `
        INSERT INTO comments (vehicle_id, user_id, comment_text, created_at)
        VALUES ($1, $2, $3, NOW()) RETURNING *;
    `;
    const values  = [vehivleId, userId, commentText];
    const result =  await pool.query(query, values);
    return result.rows[0];
}

async function getCommentsByVehicleId(vehicleId) {
    const query = `
        SELECT c.*, a.account_firstname, a.account_lastname
        FROM comments AS c
        JOIN account AS a ON c.user_id = a.account_id
        WHERE c.vehicle_id = $1
        ORDER BY c.created_at DESC;
    `;
    const result = await pool.query(query, [vehicleId]);
    console.log('Comments fetched from DB:', result.rows); // Verifica los comentarios
    return result.rows; // Asegúrate de devolver las filas correctamente
}



module.exports = {addComment, getCommentsByVehicleId}