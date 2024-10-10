const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}
  const accountModel = require("../models/account-model")
const { password } = require("pg/lib/defaults")

/***********************
 *  Resgitration Data Validation Rules
 **************************/

validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) =>{
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

validate.loginRules = () => {
  return[
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email required"),

    body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is requiered")
  ]
}



/********************************
 * check date and return errors or continue to registration
 ********************************/

validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let error = []
    error = validationResult(req)
    if (!error.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        error,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }


  validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    const error = validationResult(req);
    const nav = await utilities.getNav();
    
    // Siempre pasa el objeto 'error' a la vista
    res.render("account/login", {
      error: error.isEmpty() ? { array: () => [] } : error, // Si no hay errores, crea un objeto con un array vacío
      title: "Login",
      nav,
      account_email
    });
  
    // Si quieres continuar con el siguiente middleware solo si no hay errores, usa:
    if (!error.isEmpty()) {
      return; // Detener el flujo si hay errores
    }
    next();
  }
  
  
  
module.exports = validate