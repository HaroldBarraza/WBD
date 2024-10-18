const express = require('express');
const router = new express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');
const validate = require('../utilities/account-validation');

router.get('/login',utilities.handleError(accountController.buildLogin));

router.get('/register', utilities.handleError(accountController.buildRegister));


router.get("/", utilities.checkLogin, utilities.handleError(accountController.buildManagement))


router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleError(accountController.registerAccount)
  )


  router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    (req, res, next) => {
      console.log("Ruta /login alcanzada");
      next();
    },
    utilities.handleError(accountController.accountLogin)
);


router.get('/management', accountController.isAuthenticated, accountController.buildManagement);


module.exports = router;
