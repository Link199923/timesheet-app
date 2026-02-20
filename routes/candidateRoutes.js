const express = require('express');
const router = express.Router();
const controller = require('../controllers/candidateController');

router.get('/', controller.listCandidates);
router.get('/new', controller.showCreateForm);
router.post('/', controller.createCandidate);
router.post('/:id/hire', controller.hireCandidate);
router.delete('/:id', controller.deleteCandidate);

module.exports = router;