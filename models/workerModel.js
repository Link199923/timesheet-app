const pool = require('../config/db');

exports.getAllWorkers = async () => {
    const result = await pool.query('SELECT * FROM workers ORDER BY created_at DESC');
    return result.rows;
};

exports.getWorkerById = async (id) => {
    const result = await pool.query('SELECT * FROM workers WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createWorker = async (data) => {
    const { first_name, last_name, email, phone, trade, hourly_rate, overtime_rate } = data;

    await pool.query(
        `INSERT INTO workers 
        (first_name, last_name, email, phone, trade, hourly_rate, overtime_rate) 
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [first_name, last_name, email, phone, trade, hourly_rate, overtime_rate]
    );
};

exports.updateWorker = async (id, data) => {
    const { first_name, last_name, email, phone, trade, hourly_rate, overtime_rate } = data;

    await pool.query(
        `UPDATE workers SET 
        first_name=$1,
        last_name=$2,
        email=$3,
        phone=$4,
        trade=$5,
        hourly_rate=$6,
        overtime_rate=$7
        WHERE id=$8`,
        [first_name, last_name, email, phone, trade, hourly_rate, overtime_rate, id]
    );
};

exports.deleteWorker = async (id) => {
    await pool.query('DELETE FROM workers WHERE id=$1', [id]);
};