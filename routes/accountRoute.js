const express = require('express');
const router = new express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation')

router.get('/login',utilities.handleError(accountController.buildLogin));

router.get('/register', utilities.handleError(accountController.buildRegister));

router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleError(accountController.registerAccount)
  )
module.exports = router;
