/** load library express */
const express = require(`express`)
    /** initiate object that instance of express */
const app = express()
    /** allow to read 'request' with json type */
app.use(express.json())
    /** load member's controller */
const AdminController =
    require(`../controllers/admin.controller`)
    /** create route to get data with method "GET" */
app.get("/", AdminController.getAllAdmin)
    /** create route to add new member using method "POST" */
app.post("/", AdminController.addAdmin)
    /** create route to find member
     * using method "POST" and path "find" */
app.post("/find", AdminController.findAdmin)
    /** create route to update member
     * using method "PUT" and define parameter for "id" */
app.put("/:id", AdminController.updateAdmin)
    /** create route to delete member
     * using method "DELETE" and define parameter for "id" */
app.delete("/:id", AdminController.deleteAdmin)
    /** export app in order to load in another file */
module.exports = app
