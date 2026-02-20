const express = require('express');
const router = express.Router();
const controller = require('../controllers/timesheetController');

router.get('/', controller.listTimesheets);
router.get('/new', controller.showCreateForm);
router.post('/', controller.createTimesheet);
router.post('/:id/approve', controller.approveTimesheet);
router.delete('/:id', controller.deleteTimesheet);

module.exports = router;