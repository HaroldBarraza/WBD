const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {};

Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


Util.buildDetailHtml = async function (data) {
  let html = `
    <div class="detail-container">
      <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
      <div class="detail-content">
        <h2>${data.inv_make} ${data.inv_model}</h2>
        <p>Year: ${data.inv_year}</p>
        <p>Price: $${new Intl.NumberFormat("en-US").format(data.inv_price)}</p>
        <p>Mileage: ${new Intl.NumberFormat("en-US").format(data.inv_miles)} miles</p>
        <p>Description: ${data.inv_description}</p>
      </div>
    </div>
  `;
  return html;
};



/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/*
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
*/
Util.errorHandler500 = (err, req, res, next) => {
  console.error(err);
  res.status(500);
  res.render("errors/error", { error: err });
};
Util.handleError = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  console.log('data.rows:', data.rows);

  if (!data.rows || data.rows.length === 0) {
    return []; // Devuelve un arreglo vacío si no hay clasificaciones
  }

  return data.rows; // Devuelve el arreglo de clasificaciones
};

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}



module.exports = Util;
