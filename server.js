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

/* ***********************
 * View engine and templates
 *************************/
app.set("view engine", "ejs"); 
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static); 

// Index route
app.get("/", utilities.handleError(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

// Ruta para forzar error 500
app.get("/cause-error", utilities.handleError(errorController.throwError));

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
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if(err.status == 404){ message = err.message} else {message = 'Oh no! there was crash. Maybe try a different route? '}
  res.render("errors/error", {
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
  console.log(`app listening on ${host}:${port}`);
});
