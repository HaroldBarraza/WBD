const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

function checkAdminEmployee(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash("notice", "Please log in to access this resource.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      req.user = decoded;
      next();
    } else {
      req.flash("notice", "Access denied. Insufficient privileges.");
      return res.redirect("/account/login");
    }
  } catch (error) {
    console.error("JWT verification error:", error);
    req.flash("notice", "Your session has expired. Please log in again.");
    return res.redirect("/account/login");
  }
}

async function validateAccountUpdate(req, res, next) {
    await body('account_firstname').notEmpty().withMessage('First name is required.').run(req);
    await body('account_lastname').notEmpty().withMessage('Last name is required.').run(req);
    await body('account_email').isEmail().withMessage('Invalid email address.').run(req);
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('account/updateAccount', { title: 'Update Account', accountData: req.body, messages: { error: 'Error updating account.' } });
    }
    next();
  }
  
  async function validatePasswordChange(req, res, next) {
    await body('new_password').notEmpty().withMessage('New password is required.').run(req);
    await body('new_password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters long.').run(req);
    await body('confirm_password').notEmpty().withMessage('Confirm password is required.').run(req);
    await body('confirm_password').equals(req.body.new_password).withMessage('Passwords do not match.').run(req);
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('account/updateAccount', { title: 'Update Account', accountData: req.body, messages: { error: 'Error changing password.' } });
    }
    next();
  }

module.exports = { checkAdminEmployee,  validateAccountUpdate, validatePasswordChange };