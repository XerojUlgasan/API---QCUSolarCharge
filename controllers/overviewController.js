const pool = require("../utils/supabase/supabasedb")
const getDayRange = require("../utils/getFirstAndLastHourOfTheDay")
const { getStateOfCharge } = require("../utils/getBatteryPercentage")

exports.getOverview = async (req, res) => {
    console.log("Attempting a GET for /overview")

    try {
        const overviewData = {
            active: 0,
            total_power: 0,
            transactions_today: 0,
            devices: []
        }

        // Get devices with their latest data
        const devicesResult = await pool.query(`
            SELECT 
                d.device_id,
                d.name,
                d.building,
                d.location,
                d.date_added,
                dd.volt,
                dd.current,
                dd.energy,
                dd.power,
                dd."battVolt",
                dd.temperature,
                dd.last_updated
            FROM tbl_devices d
            LEFT JOIN tbl_devicesdata dd ON d.device_id = dd.device_id
        `)

        if (devicesResult.rows.length > 0) {
            devicesResult.rows.forEach(device => {
                // Count active devices (assuming active if it has recent data)
                if (device.power !== null) {
                    overviewData.active += 1
                }
                
                overviewData.total_power += Number(device.power || 0)
                
                overviewData.devices.push({
                    id: device.device_id,
                    device_id: device.device_id,
                    name: device.name,
                    building: device.building,
                    location: device.location,
                    date_added: device.date_added,
                    volt: Number(device.volt || 0),
                    current: Number(device.current || 0),
                    energy: Number(device.energy || 0),
                    power: Number(device.power || 0),
                    battVolt: Number(device.battVolt || 0),
                    temperature: Number(device.temperature || 0),
                    last_updated: device.last_updated,
                    percentage: getStateOfCharge(device.battVolt)
                })
            })
        }

        // Get transactions today
        const { startOfDay, endOfDay } = getDayRange()
        const transactionsResult = await pool.query(
            'SELECT COUNT(*) as count FROM tbl_sessions WHERE date_time >= $1 AND date_time <= $2',
            [startOfDay, endOfDay]
        )
        
        overviewData.transactions_today = parseInt(transactionsResult.rows[0].count)

        return res.json({ success: true, overview: overviewData })
    } catch (e) {
        console.error("Error fetching overview:", e)
        return res.status(500).json({ success: false, message: e.message })
    }
}