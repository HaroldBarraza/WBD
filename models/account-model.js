const pool = require('../database/')

/**************************
 * Register New Account
***************************/

async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    console.log('account_firstname:', account_firstname);
    console.log('account_lastname:', account_lastname);
    console.log('account_email:', account_email);
    console.log('account_password:', account_password);
    if (!account_firstname || !account_lastname || !account_email || !account_password) {
      throw new Error('Todos los campos son obligatorios');
    }
  
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      console.error('Error registering account:', error);
      return error.message;
    }
  }

module.exports = { registerAccount }