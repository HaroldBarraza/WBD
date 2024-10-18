const router = require('../routes/static');
const utilities = require('../utilities');
const baseController = require('./baseController');
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash()
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    messages: req.flash("notice")
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    error: null,
  })
}

/* ****************************************
*  Process the login attemp
* *************************************** */
router.post(
  "/login",
  (req, res) => {
    res.status(200).send("login process")
  }
)

async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body; // Asegúrate de que estas variables estén correctamente asignadas
  
  console.log("Datos recibidos del formulario:", req.body); // Muestra todos los datos del formulario
  console.log("Intentando iniciar sesión para:", account_email); // Muestra el correo electrónico

  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
    console.log("Usuario no encontrado");
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  console.log("Usuario encontrado:", accountData); // Muestra los datos del usuario encontrado

  try {
    console.log("Verificando contraseña...");
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    console.log("¿Contraseña correcta?", passwordMatch); // Muestra el resultado de la comparación de la contraseña

    if (passwordMatch) {
      console.log("Contraseña correcta");
      delete accountData.account_password; // Elimina la contraseña de los datos del usuario
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log("Token generado:", accessToken); // Muestra el token generado
      
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        maxAge: 3600 * 1000
      });
      console.log("Cookie jwt configurada"); // Indica que se ha configurado la cookie

      console.log("Redirigiendo a /account");
      return res.redirect("/account"); // Redirige al usuario a la página de cuenta
    } else {
      console.log("Contraseña incorrecta");
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    req.flash("error", "An error occurred during login. Please try again.");
    console.error("Error during login:", error); // Muestra el error en la consola
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
}



async function accountManagement(req, res) {
  console.log("Rendering account management view");
  let nav = await utilities.getNav();
  res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      messages: req.flash()
  });
}


async function buildManagement(req, res) {
  let nav = await utilities.getNav(); // Obtiene la navegación del sitio
  const messages = {
      notice: req.flash("notice"), // Mensajes informativos
      error: req.flash("error"),     // Mensajes de error
  };

  try {
      // Aquí puedes obtener datos adicionales necesarios para la vista, como cuentas
      const accounts = await accountModel.getAllAccounts(); // Obtiene todas las cuentas (ajusta según tu modelo)

      res.render("account/accountManagement", {
          title: "Gestión de Cuentas", // Título de la página
          nav,                          // Navegación del sitio
          messages,                     // Mensajes para mostrar
          accounts,                     // Datos de cuentas para la vista
      });
  } catch (error) {
      console.error("Error al construir la gestión de cuentas:", error);
      req.flash("error", "Error al cargar la gestión de cuentas. Por favor, inténtelo más tarde.");
      res.status(500).render("account/accountManagement", {
          title: "Gestión de Cuentas",
          nav,
          messages,
          accounts: [], // Devuelve una lista vacía en caso de error
      });
  }
}


function isAuthenticated(req, res, next) {
  const token = req.cookies.jwt; // Obtener el token de la cookie
  if (!token) {
      return res.redirect('/account/login'); // Redirigir si no está autenticado
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
          return res.redirect('/account/login'); // Redirigir si hay un error
      }
      req.user = user; // Almacenar el usuario en la solicitud
      next(); // Continuar al siguiente middleware
  });
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, accountManagement, buildManagement, isAuthenticated };