const express = require("express");
const router = express.Router();
const controller = require("../controllers/timesheetController");

router.get("/", controller.listTimesheets);
router.get("/new", controller.showCreateForm);
router.post("/", controller.createTimesheet);
router.delete("/:id", controller.deleteTimesheet);
router.get("/:id/edit", controller.showEditForm);
router.put("/:id", controller.updateTimesheet);
router.post("/:id/status", controller.changeStatus);

module.exports = router;
