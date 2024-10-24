/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config(); 
const app = express();
const static = require("./routes/static");
const inventoryRoute = require('./routes/inventoryRoute');
const baseController = require('./controllers/baseController');
const utilities = require('./utilities');
const errorController = require('./controllers/errorController');
const session = require("express-session");
const pool = require('./database/')
const accountRoute = require('./routes/accountRoute');
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware 
 *************************/
app.use(session({
  store:new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave:true,
  saveUninitialized: true,
  name: 'sessionId'
}))
app.use(cookieParser())
app.use(require('connect-flash')())
app.use(utilities.checkJWTToken)



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))




app.use('/account', require("./routes/accountRoute"));

/* ***********************
 * Express Message Middleware
 *************************/
app.use(function(req, res,next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})







/* ***********************
 * View engine and templates
 *************************/
app.set("view engine", "ejs"); 
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin;
  res.locals.accountData = req.session.accountData;
  next();
});

/* ***********************
 * Routes
 *************************/
app.use(static); 

/************** 
Index route
**************/
app.get("/", utilities.handleError(baseController.buildHome));
/************** 
Inventory routes
**************/
app.use("/inv", inventoryRoute);

/************** 
Trigger intentional error
**************/
app.get("/error", utilities.handleError(errorController.throwError));

/* ***********************
 * File not found (404)
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (navError) {
    console.error(`Failed to get navigation: ${navError.message}`);
    nav = null;
  }

  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message;
  if (err.status === 404) {
    message = err.message;
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?';
  }
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000; 
const host = process.env.HOST || '0.0.0.0';

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, host, () => {
  console.log(`App listening on ${host}:${port}`);
});
