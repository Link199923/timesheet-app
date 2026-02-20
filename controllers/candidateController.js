const Candidate = require('../models/candidateModel');

exports.listCandidates = async (req, res) => {
    const candidates = await Candidate.getAllCandidates();
    res.render('candidates/list', { candidates });
};

exports.showCreateForm = (req, res) => {
    res.render('candidates/create');
};

exports.createCandidate = async (req, res) => {
    await Candidate.createCandidate(req.body);
    res.redirect('/candidates');
};

exports.hireCandidate = async (req, res) => {
    await Candidate.hireCandidate(req.params.id);
    res.redirect('/candidates');
};

exports.deleteCandidate = async (req, res) => {
    await Candidate.deleteCandidate(req.params.id);
    res.redirect('/candidates');
};