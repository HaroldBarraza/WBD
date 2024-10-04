const { route } = require("../routes/static");

router.get("/type/:classificationId", invController.buildByClassificationId);
module.exports = router;