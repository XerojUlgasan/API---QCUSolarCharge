const pool = require("../utils/supabase/supabasedb")
const defaultConfig = require("../utils/defaultConfig")

exports.postEnergy = async (req, res) => {
    const { deviceId, energy, voltage, current, temperature } = req.body

    // Validate input
    if (deviceId == undefined || energy == undefined || voltage == undefined || current == undefined || temperature == undefined) {
        return res.status(400).json({ message: "Missing required fields" })
    }

    try {
        // Check if device exists
        const deviceCheck = await pool.query(
            'SELECT device_id FROM tbl_devices WHERE device_id = $1',
            [deviceId]
        )

        if (deviceCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Device Not Exist"
            })
        }

        // Insert energy history
        await pool.query(
            'INSERT INTO tbl_energyhistory ("energyHistory_id", device_id, date_time, voltage, current, energy_accumulated, temperature) VALUES (gen_random_uuid()::text, $1, NOW() AT TIME ZONE \'Asia/Manila\', $2, $3, $4, $5)',
            [deviceId, voltage, current, energy, temperature]
        )

        return res.status(200).json({ message: "Energy data inserted successfully" })
    } catch (e) {
        console.error("Error inserting energy data:", e)
        return res.status(500).json({ message: e.message })
    }
}

exports.getDeviceHistory = async (req, res) => {
    const { deviceId } = req.query

    if (!deviceId) {
        return res.status(400).json({ message: "Missing deviceId parameter" })
    }

    try {
        // Get transactions
        const transactionsResult = await pool.query(
            'SELECT * FROM tbl_sessions WHERE device_id = $1 ORDER BY date_time DESC',
            [deviceId]
        )

        // Get energy history data
        const dataResult = await pool.query(
            'SELECT * FROM tbl_energyhistory WHERE device_id = $1 ORDER BY date_time DESC',
            [deviceId]
        )

        const history = {
            transactions: transactionsResult.rows,
            data: dataResult.rows
        }

        return res.status(200).json(history)
    } catch (e) {
        console.error("Error fetching device history:", e)
        return res.status(500).json({ message: e.message })
    }
}

exports.addDevice = async (req, res) => {
    const { device_id } = req.body

    if (!device_id) {
        return res.status(400).json({ message: "Missing device_id parameter" })
    }

    try {
        // Insert device with device_id provided by the device itself
        await pool.query(
            'INSERT INTO tbl_devices (device_id, name, location, building, date_added) VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE \'Asia/Manila\')',
            [device_id, device_id, 'Not set', 'Not set']
        )

        return res.status(200).json({ message: "Device added successfully" })
    } catch (e) {
        console.error("Error adding device:", e)
        return res.status(500).json({ message: e.message })
    }
}

exports.giveUpdates = async (req, res) => {
    const { voltage, current, energy, power, temperature, device_id, battVolt } = req.body

    if (voltage == undefined || current == undefined || energy == undefined || power == undefined || temperature == undefined || device_id == undefined || battVolt == undefined) {
        return res.status(400).json({ message: "Missing required fields" })
    }

    try {
        // Check if device exists
        const deviceCheck = await pool.query(
            'SELECT device_id FROM tbl_devices WHERE device_id = $1',
            [device_id]
        )

        if (deviceCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Device Not Exist"
            })
        }
 
        // Check if device data exists and update, or insert if first time
        const existingData = await pool.query(
            'SELECT data_id FROM tbl_devicesdata WHERE device_id = $1',
            [device_id]
        )

        if (existingData.rows.length > 0) {
            // Update existing device data
            await pool.query(
                `UPDATE tbl_devicesdata SET
                    volt = $2,
                    current = $3,
                    energy = $4,
                    power = $5,
                    "battVolt" = $6,
                    temperature = $7,
                    last_updated = NOW() AT TIME ZONE 'Asia/Manila'
                 WHERE device_id = $1`,
                [device_id, voltage, current, energy, power, battVolt, temperature]
            )
        } else {
            // Insert new device data (first time receiving data from this device)
            await pool.query(
                `INSERT INTO tbl_devicesdata (data_id, device_id, volt, current, energy, power, "battVolt", temperature, last_updated)
                 VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW() AT TIME ZONE 'Asia/Manila')`,
                [device_id, voltage, current, energy, power, battVolt, temperature]
            )
        }

        return res.status(200).json({ success: true })
    } catch (e) {
        console.error("Error updating device data:", e)
        return res.status(500).json({
            message: e.message
        })
    }
}

exports.checkExist = async (req, res) => {
    const { device_id } = req.query

    if (device_id == undefined) {
        return res.status(400).json({ message: "Missing device_id parameter" })
    }

    try {
        const result = await pool.query(
            'SELECT device_id FROM tbl_devices WHERE device_id = $1',
            [device_id]
        )

        return res.status(200).json({ doExist: result.rows.length > 0 })
    } catch (e) {
        console.error("Error checking device existence:", e)
        return res.status(500).json({ message: e.message })
    }
}

exports.getConfig = async (req, res) => {
    const { device_id } = req.body

    if (device_id == undefined) {
        return res.status(400).json({ message: "device_id is undefined" })
    }

    try {
        // Check if device exists
        const deviceCheck = await pool.query(
            'SELECT device_id FROM tbl_devices WHERE device_id = $1',
            [device_id]
        )

        if (deviceCheck.rows.length === 0) {
            return res.status(400).json({ message: "Device Not Exist" })
        }

        // Get device config
        const configResult = await pool.query(
            'SELECT * FROM tbl_deviceconfig WHERE device_id = $1',
            [device_id]
        )

        if (configResult.rows.length > 0) {
            return res.status(200).json(configResult.rows[0])
        } else {
            return res.status(200).json(defaultConfig)
        }
    } catch (e) {
        console.error("Error getting device config:", e)
        return res.status(500).json({ message: e.message })
    }
}

exports.setEnability = async (req, res) => {
    const { deviceId, isEnabled } = req.body

    if (deviceId === undefined || isEnabled === undefined) {
        console.log("invalid")
        return res.status(400).json({
            message: "Invalid Input"
        })
    }

    try {
        // Check if device exists
        const deviceCheck = await pool.query(
            'SELECT device_id FROM tbl_devices WHERE device_id = $1',
            [deviceId]
        )

        if (deviceCheck.rows.length === 0) {
            return res.status(401).json({
                message: "Device does not exists"
            })
        }

        // Insert or update device config (upsert)
        await pool.query(
            `INSERT INTO tbl_deviceconfig ("deviceConfig_id", device_id, device_enabled)
             VALUES (gen_random_uuid()::text, $1, $2)
             ON CONFLICT (device_id) DO UPDATE SET
                device_enabled = EXCLUDED.device_enabled`,
            [deviceId, isEnabled]
        )

        return res.status(200).json({
            success: true
        })
    } catch (error) {
        console.log("Error occured : " + error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}