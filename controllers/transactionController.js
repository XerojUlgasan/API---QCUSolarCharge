const pool = require("../utils/supabase/supabasedb")

exports.getTransactions = async (req, res) => {
    console.log("Attempting a GET request for /transactions")
    
    try {
        if(req.query.device_id){
            // Retrieve transactions for specific device
            const { rows } = await pool.query(
                'SELECT * FROM tbl_sessions WHERE device_id = $1 ORDER BY date_time DESC',
                [req.query.device_id]
            )
            res.json(rows)
        }else {
            // Retrieve all transactions
            const { rows } = await pool.query('SELECT * FROM tbl_sessions ORDER BY date_time DESC')
            res.json(rows)
        }
    } catch (e) {
        res.status(500).json({ success: false, message: e.message })
    }
}

exports.setTransaction = async (req, res) => {
    console.log("Attempting a POST request for /transactions")
    
    const { amount, device_id } = req.body

    if(!amount || !device_id){
        return res.status(400).json({ success: false, message: "Amount and device_id are required" })
    }

    try {
        await pool.query(
            `INSERT INTO tbl_sessions (transaction_id, device_id, date_time, amount) 
             VALUES (gen_random_uuid()::text, $1, NOW(), $2)`,
            [device_id, amount]
        )
        
        res.json({ success: true })
    } catch (e) {
        res.status(500).json({ success: false, message: e.message })
    }
}