const pool = require("./supabase/supabasedb")

const insertAlert = async (cont, id, thrt, type) => {
    try {
        // Insert alert into tbl_alerts
        await pool.query(
            'INSERT INTO tbl_alerts (alert_id, device_id, content, threat_level, date_time) VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())',
            [id, cont, thrt]
        )

        console.log("Alert Sent")
    } catch (e) {
        console.error("Error inserting alert:", e)
        throw e
    }
}

module.exports = insertAlert