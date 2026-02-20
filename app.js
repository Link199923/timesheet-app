// ===============================
// Core Dependencies
// ===============================
const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

// ===============================
// Database
// ===============================
const pool = require("./config/db");

// ===============================
// Route Imports
// ===============================
const workerRoutes = require("./routes/workerRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");

// ===============================
// App Initialization
// ===============================
const app = express();

// ===============================
// Middleware Configuration
// ===============================

// Parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Allow PUT & DELETE in forms
app.use(methodOverride("_method"));

// Serve static files
app.use(express.static("public"));

// Enable EJS layouts
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout");

// ===============================
// Dashboard Route (Dynamic)
// ===============================
app.get("/", async (req, res) => {
  try {
    // Total Workers
    const workersResult = await pool.query(`SELECT COUNT(*) FROM workers`);

    // Candidates not hired
    const candidatesResult = await pool.query(
      `SELECT COUNT(*) FROM candidates WHERE status != 'hired'`,
    );

    // Weekly payroll summary
    const weeklyResult = await pool.query(`
      SELECT 
        SUM(t.regular_hours) AS total_regular,
        SUM(t.overtime_hours) AS total_overtime,
        SUM(t.regular_hours * w.hourly_rate +
            t.overtime_hours * w.overtime_rate) AS total_pay
      FROM timesheets t
      JOIN workers w ON t.worker_id = w.id
      WHERE t.work_date >= date_trunc('week', CURRENT_DATE)
    `);

    // Pending timesheets
    const pendingResult = await pool.query(
      `SELECT COUNT(*) FROM timesheets WHERE approved = FALSE`,
    );

    res.render("dashboard", {
      totalWorkers: workersResult.rows[0].count,
      totalCandidates: candidatesResult.rows[0].count,
      totalRegularHours: weeklyResult.rows[0].total_regular || 0,
      totalOvertimeHours: weeklyResult.rows[0].total_overtime || 0,
      totalPayroll: weeklyResult.rows[0].total_pay || 0,
      pendingTimesheets: pendingResult.rows[0].count,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Dashboard error");
  }
});

// ===============================
// Feature Routes
// ===============================
app.use("/workers", workerRoutes);
app.use("/candidates", candidateRoutes);
app.use("/timesheets", timesheetRoutes);

// ===============================
// Start Server
// ===============================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
