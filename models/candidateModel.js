const pool = require('../config/db');

exports.getAllCandidates = async () => {
    const result = await pool.query(
        'SELECT * FROM candidates ORDER BY created_at DESC'
    );
    return result.rows;
};

exports.getCandidateById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM candidates WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

exports.createCandidate = async (data) => {
    const { first_name, last_name, email, phone, trade, notes } = data;

    await pool.query(
        `INSERT INTO candidates
        (first_name, last_name, email, phone, trade, notes)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [first_name, last_name, email, phone, trade, notes]
    );
};

exports.updateCandidateStatus = async (id, status) => {
    await pool.query(
        `UPDATE candidates SET status = $1 WHERE id = $2`,
        [status, id]
    );
};

exports.deleteCandidate = async (id) => {
    await pool.query(
        'DELETE FROM candidates WHERE id = $1',
        [id]
    );
};

exports.hireCandidate = async (id) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const candidateResult = await client.query(
            'SELECT * FROM candidates WHERE id = $1',
            [id]
        );

        const candidate = candidateResult.rows[0];

        if (!candidate) throw new Error('Candidate not found');

        // Insert into workers
        await client.query(
            `INSERT INTO workers
            (first_name, last_name, email, phone, trade, hourly_rate, overtime_rate)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
                candidate.first_name,
                candidate.last_name,
                candidate.email,
                candidate.phone,
                candidate.trade,
                0,  // default hourly rate (admin sets later)
                0
            ]
        );

        // Update candidate status
        await client.query(
            `UPDATE candidates SET status = 'hired' WHERE id = $1`,
            [id]
        );

        await client.query('COMMIT');

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};