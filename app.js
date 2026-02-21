// ===============================
// Environment Config
// ===============================
require("dotenv").config();

// ===============================
// Core Dependencies
// ===============================
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");

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
const authRoutes = require("./routes/authRoutes");
const { ensureAuthenticated } = require("./middleware/auth");

// ===============================
// App Initialization
// ===============================
const app = express();

app.set("trust proxy", 1);

// ===============================
// Session Configuration (Render Safe)
// ===============================
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "user_sessions",
    }),
    secret: process.env.SESSION_SECRET || "superSecretDevKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true on Render
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  }),
);

// ===============================
// Middleware Configuration
// ===============================
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout");

// ===============================
// Register Auth Routes (NOT protected)
// ===============================
app.use(authRoutes);

// ===============================
// Protect Everything After This
// ===============================
app.use(ensureAuthenticated);

// ===============================
// Dashboard Route (Protected)
// ===============================
app.get("/", async (req, res) => {
  try {
    const workersResult = await pool.query(`SELECT COUNT(*) FROM workers`);

    const candidatesResult = await pool.query(
      `SELECT COUNT(*) FROM candidates WHERE status != 'hired'`,
    );

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
// Feature Routes (Protected)
// ===============================
app.use("/workers", workerRoutes);
app.use("/candidates", candidateRoutes);
app.use("/timesheets", timesheetRoutes);

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
