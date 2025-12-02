const pool = require("./supabase/supabasedb")

const insertConfig = async (data, devId) => {
    try {
        // Check if config exists
        const existing = await pool.query(
            'SELECT "deviceConfig_id" FROM tbl_deviceconfig WHERE device_id = $1',
            [devId]
        )

        if (existing.rows.length > 0) {
            // Update existing config
            const updateFields = []
            const updateValues = [devId]
            let paramCount = 2

            if (data.device_enabled !== undefined) {
                updateFields.push(`device_enabled = $${paramCount++}`)
                updateValues.push(data.device_enabled || data.device_alert_enabled)
            }
            if (data.max_batt !== undefined) {
                updateFields.push(`max_batt = $${paramCount++}`)
                updateValues.push(data.max_batt)
            }
            if (data.min_batt !== undefined) {
                updateFields.push(`min_batt = $${paramCount++}`)
                updateValues.push(data.min_batt)
            }
            if (data.max_temp !== undefined) {
                updateFields.push(`max_temp = $${paramCount++}`)
                updateValues.push(data.max_temp)
            }
            if (data.min_temp !== undefined) {
                updateFields.push(`min_temp = $${paramCount++}`)
                updateValues.push(data.min_temp)
            }
            if (data.minute_per_peso !== undefined) {
                updateFields.push(`minute_per_peso = $${paramCount++}`)
                updateValues.push(data.minute_per_peso)
            }
            if (data.samples_per_hour !== undefined) {
                updateFields.push(`samples_per_hour = $${paramCount++}`)
                updateValues.push(data.samples_per_hour)
            }
            if (data.update_gap_seconds !== undefined) {
                updateFields.push(`update_gap_seconds = $${paramCount++}`)
                updateValues.push(data.update_gap_seconds)
            }

            if (updateFields.length > 0) {
                await pool.query(
                    `UPDATE tbl_deviceconfig SET ${updateFields.join(', ')} WHERE device_id = $1`,
                    updateValues
                )
            }
        } else {
            // Insert new config
            await pool.query(
                `INSERT INTO tbl_deviceconfig ("deviceConfig_id", device_id, device_enabled, max_batt, min_batt, max_temp, min_temp, minute_per_peso, samples_per_hour, update_gap_seconds)
                 VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    devId,
                    data.device_enabled || data.device_alert_enabled,
                    data.max_batt,
                    data.min_batt,
                    data.max_temp,
                    data.min_temp,
                    data.minute_per_peso,
                    data.samples_per_hour,
                    data.update_gap_seconds
                ]
            )
        }
    } catch (e) {
        console.error("Error inserting device config:", e)
        throw e
    }
}

module.exports = insertConfig