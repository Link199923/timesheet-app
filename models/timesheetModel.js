const pool = require('../config/db');

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
        ORDER BY t.work_date DESC
    `);
    return result.rows;
};

exports.getTimesheetsByWorker = async (worker_id) => {
    const result = await pool.query(`
        SELECT * FROM timesheets
        WHERE worker_id = $1
        ORDER BY work_date DESC
    `, [worker_id]);

    return result.rows;
};

exports.createTimesheet = async (data) => {
    const { worker_id, work_date, project_name, regular_hours, overtime_hours } = data;

    await pool.query(
        `INSERT INTO timesheets
        (worker_id, work_date, project_name, regular_hours, overtime_hours)
        VALUES ($1,$2,$3,$4,$5)`,
        [worker_id, work_date, project_name, regular_hours || 0, overtime_hours || 0]
    );
};

exports.approveTimesheet = async (id) => {
    await pool.query(
        `UPDATE timesheets SET approved = TRUE WHERE id = $1`,
        [id]
    );
};

exports.deleteTimesheet = async (id) => {
    await pool.query(
        `DELETE FROM timesheets WHERE id = $1`,
        [id]
    );
};