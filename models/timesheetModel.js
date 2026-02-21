const pool = require("../config/db");

exports.getAllTimesheets = async () => {
  const result = await pool.query(`
        SELECT 
            t.*,
            w.first_name,
            w.last_name,
            w.hourly_rate,
            w.overtime_rate
        FROM timesheets t
        JOIN workers w ON t.worker_id = w.id
        ORDER BY t.start_date DESC
    `);
  return result.rows;
};

exports.getTimesheetsByWorker = async (worker_id) => {
  const result = await pool.query(
    `
        SELECT * FROM timesheets
        WHERE worker_id = $1
        ORDER BY work_date DESC
    `,
    [worker_id],
  );

  return result.rows;
};

exports.createTimesheet = async (data) => {
  const {
    worker_id,
    start_date,
    end_date,
    project_name,
    regular_hours,
    overtime_hours,
  } = data;

  await pool.query(
    `INSERT INTO timesheets
        (worker_id, start_date, end_date, project_name, regular_hours, overtime_hours)
        VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      worker_id,
      start_date,
      end_date,
      project_name,
      regular_hours || 0,
      overtime_hours || 0,
    ],
  );
};

exports.updateStatus = async (id, status, comment = null) => {
  await pool.query(
    `UPDATE timesheets 
     SET status = $1,
         comment = $2
     WHERE id = $3`,
    [status, comment || null, id],
  );
};

exports.deleteTimesheet = async (id) => {
  await pool.query(`DELETE FROM timesheets WHERE id = $1`, [id]);
};

exports.updateDecision = async (id, status, note) => {
  await pool.query(
    `UPDATE candidates 
         SET status=$1, decision_note=$2
         WHERE id=$3`,
    [status, note, id],
  );
};
