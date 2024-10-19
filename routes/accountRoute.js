const express = require('express');
const router = new express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');
const validationMiddleware = require("../middleware/authMiddleware")

// Rutas de autenticación
router.get('/login', utilities.handleError(accountController.buildLogin));
router.get('/register', utilities.handleError(accountController.buildRegister));

// Ruta para la gestión de cuentas (asegúrate de que el usuario esté autenticado)
router.get('/management', utilities.checkLogin, utilities.handleError(accountController.accountManagement));

// Rutas para registro y login
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleError(accountController.registerAccount)
);

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

// Ruta para cerrar sesión
router.get("/logout", utilities.checkLogin, accountController.logout);
router.get('/', utilities.checkLogin, utilities.handleError(accountController.accountManagement));



// Ruta para manejar la actualización de la cuenta
router.post('/update', validationMiddleware.validateAccountUpdate, accountController.updateAccount);

// Ruta para manejar el cambio de contraseña
router.post('/change-password', validationMiddleware.validatePasswordChange, accountController.changePassword);
router.get('/update/:id', accountController.getUpdateView);

router.post('/logout', (req, res) => {
  // Eliminar la cookie del token
  res.clearCookie('token'); // Asegúrate de que 'token' sea el nombre correcto de tu cookie
  // Redirigir al cliente a la vista de inicio
  res.redirect('/');
});

module.exports = router;