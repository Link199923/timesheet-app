const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

router.get('/', workerController.listWorkers);
router.get('/new', workerController.showCreateForm);
router.post('/', workerController.createWorker);
router.get('/:id/edit', workerController.showEditForm);
router.put('/:id', workerController.updateWorker);
router.delete('/:id', workerController.deleteWorker);

module.exports = router;