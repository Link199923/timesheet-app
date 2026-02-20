const Worker = require('../models/workerModel');

exports.listWorkers = async (req, res) => {
    const workers = await Worker.getAllWorkers();
    res.render('workers/list', { workers });
};

exports.showCreateForm = (req, res) => {
    res.render('workers/create');
};

exports.createWorker = async (req, res) => {
    await Worker.createWorker(req.body);
    res.redirect('/workers');
};

exports.showEditForm = async (req, res) => {
    const worker = await Worker.getWorkerById(req.params.id);
    res.render('workers/edit', { worker });
};

exports.updateWorker = async (req, res) => {
    await Worker.updateWorker(req.params.id, req.body);
    res.redirect('/workers');
};

exports.deleteWorker = async (req, res) => {
    await Worker.deleteWorker(req.params.id);
    res.redirect('/workers');
};