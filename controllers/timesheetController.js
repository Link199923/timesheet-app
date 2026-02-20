const Timesheet = require('../models/timesheetModel');
const pool = require('../config/db');

exports.listTimesheets = async (req, res) => {
    const timesheets = await Timesheet.getAllTimesheets();

    // Calculate payroll dynamically
    const calculated = timesheets.map(t => {
        const regularPay = t.regular_hours * t.hourly_rate;
        const overtimePay = t.overtime_hours * t.overtime_rate;
        const totalPay = regularPay + overtimePay;

        return {
            ...t,
            regularPay,
            overtimePay,
            totalPay
        };
    });

    res.render('timesheets/list', { timesheets: calculated });
};

exports.showCreateForm = async (req, res) => {
    const workers = await pool.query('SELECT id, first_name, last_name FROM workers WHERE is_active = TRUE');
    res.render('timesheets/create', { workers: workers.rows });
};

exports.createTimesheet = async (req, res) => {
    await Timesheet.createTimesheet(req.body);
    res.redirect('/timesheets');
};

exports.approveTimesheet = async (req, res) => {
    await Timesheet.approveTimesheet(req.params.id);
    res.redirect('/timesheets');
};

exports.deleteTimesheet = async (req, res) => {
    await Timesheet.deleteTimesheet(req.params.id);
    res.redirect('/timesheets');
};