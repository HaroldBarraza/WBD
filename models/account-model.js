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

  async function checkExistingEmail(account_email) {
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const email = await pool.query(sql, [account_email])
      return email.rowCount
    }
    catch (error){
      return error.message
    }
  }

  /* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function getAccountById(accountId) {
  const query = 'SELECT * FROM account WHERE account_id = $1'; // Asegúrate de que la tabla sea 'account'
  const result = await pool.query(query, [accountId]); // Cambia a pool.query
  return result.rows[0]; // Devuelve el primer resultado
}

async function updateAccount(account_id, firstname, lastname, email) {
  const query = 'UPDATE accounts SET firstname = ?, lastname = ?, email = ? WHERE account_id = ?';
  await pool.execute(query, [firstname, lastname, email, account_id]);
}

async function updatePassword(account_id, hashedPassword) {
  const query = 'UPDATE accounts SET password = ? WHERE account_id = ?';
  await pool.execute(query, [hashedPassword, account_id]);
}
  

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword }