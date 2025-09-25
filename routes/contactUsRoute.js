const exppress = require("express")
const router = exppress.Router()
const contactController = require("../controllers/contactController")

router.get("/getContact", contactController.getContactUs)
router.post("/postContact", contactController.postContactUs)

module.exports = router