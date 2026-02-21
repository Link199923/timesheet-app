const Timesheet = require("../models/timesheetModel");
const pool = require("../config/db");

exports.listTimesheets = async (req, res) => {
  const timesheets = await Timesheet.getAllTimesheets();

  // Calculate payroll dynamically
  const calculated = timesheets.map((t) => {
    const regularPay = t.regular_hours * t.hourly_rate;
    const overtimePay = t.overtime_hours * t.overtime_rate;
    const totalPay = regularPay + overtimePay;

    return {
      ...t,
      regularPay,
      overtimePay,
      totalPay,
    };
  });

  res.render("timesheets/list", { timesheets: calculated });
};

exports.showCreateForm = async (req, res) => {
  const workers = await pool.query(
    "SELECT id, first_name, last_name FROM workers WHERE is_active = TRUE",
  );
  res.render("timesheets/create", { workers: workers.rows });
};

exports.createTimesheet = async (req, res) => {
  await Timesheet.createTimesheet(req.body);
  res.redirect("/timesheets");
};

// exports.approveTimesheet = async (req, res) => {
//   await Timesheet.approveTimesheet(req.params.id);
//   res.redirect("/timesheets");
// };

exports.deleteTimesheet = async (req, res) => {
  await Timesheet.deleteTimesheet(req.params.id);
  res.redirect("/timesheets");
};

exports.showEditForm = async (req, res) => {
  const timesheet = await pool.query(`SELECT * FROM timesheets WHERE id = $1`, [
    req.params.id,
  ]);

  res.render("timesheets/edit", {
    timesheet: timesheet.rows[0],
  });
};

exports.updateTimesheet = async (req, res) => {
  const { start_date, end_date, project_name, regular_hours, overtime_hours } =
    req.body;

  await pool.query(
    `UPDATE timesheets SET
            start_date=$1,
            end_date=$2,
            project_name=$3,
            regular_hours=$4,
            overtime_hours=$5
         WHERE id=$6`,
    [
      start_date,
      end_date,
      project_name,
      regular_hours,
      overtime_hours,
      req.params.id,
    ],
  );

  res.redirect("/timesheets");
};

exports.changeStatus = async (req, res) => {
  const { status, comment } = req.body;
  await Timesheet.updateStatus(req.params.id, status, comment);
  res.redirect("/timesheets");
};
