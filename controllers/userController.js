const pool = require("../utils/supabase/supabasedb")

exports.recordLogin = async (req, res) => {
    const {user_id, email, full_name} = req.body

    if (!user_id || !email || !full_name) {
        return res.status(400).json({message: "Invalid parameters"})
    }

    try {
        await pool.query(
            `INSERT INTO tbl_users (user_id, email, full_name, last_login) 
             VALUES ($1, $2, $3, NOW() AT TIME ZONE 'Asia/Manila')
             ON CONFLICT (user_id) 
             DO UPDATE SET email = $2, full_name = $3, last_login = NOW() AT TIME ZONE 'Asia/Manila'`,
            [user_id, email, full_name]
        )

        return res.status(200).json({message: "Log Successful"})
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

exports.recordLogout = async (req, res) => {
    const {user_id} = req.body

    if (!user_id) {
        return res.status(400).json({message: "Invalid parameters"})
    }

    try {
        await pool.query(
            `UPDATE tbl_users SET last_logout = NOW() AT TIME ZONE 'Asia/Manila' WHERE user_id = $1`,
            [user_id]
        )

        return res.status(200).json({message: "Logout Successful"})
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}