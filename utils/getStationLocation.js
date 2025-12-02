const pool = require("./supabase/supabasedb")

async function getStationLocation(){
    try {
        const result = await pool.query(
            'SELECT device_id, location, building FROM tbl_devices ORDER BY device_id'
        )

        return result.rows.map(device => ({
            location: device.location,
            building: device.building,
            device_id: device.device_id
        }))
    } catch (e) {
        console.error("Error getting station locations:", e)
        return []
    }
}

module.exports = getStationLocation