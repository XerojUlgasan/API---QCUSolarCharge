const pool = require("./supabase/supabasedb")
const getDayRange = require("../utils/getFirstAndLastHourOfTheDay")
const getWeekRange = require("../utils/getFirstAndLastHourOfTheWeek")
const getMonthRange = require("../utils/getFirstAndLastHourOfTheMonth") 
const {getStateOfCharge} = require("../utils/getBatteryPercentage")

const {startOfDay, endOfDay} = getDayRange()
const {startOfWeek, endOfWeek} = getWeekRange()
const {startOfMonth, endOfMonth} = getMonthRange()   

const getDeviceDetails = async (deviceId) => {
    const data = {
        revenue: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            total: 0
        },
        uses: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            total: 0
        },
        energy: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            total: 0
        },
        transactions: [],
        maintenance: [],
        total_hours: 0,
        volt: 0,
        current: 0,
        power: 0,
        temperature: 0,
        percentage: 0,
        device_id: "",
        alerts: [],
        energy_history: []
    }

    // Get device with its data
    const deviceResult = await pool.query(`
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
        WHERE d.device_id = $1
    `, [deviceId])

    if(deviceResult.rows.length > 0){
        const device = deviceResult.rows[0]
        data.device_id = device.device_id
        data.volt = Number(device.volt || 0)
        data.current = Number(device.current || 0)
        data.power = Number(device.power || 0)
        data.temperature = Number(device.temperature || 0)
        data.percentage = getStateOfCharge(device.battVolt ?? 0)
    }

    // Get transactions for this device
    const transactionResult = await pool.query(
        'SELECT * FROM tbl_sessions WHERE device_id = $1 ORDER BY date_time DESC',
        [deviceId]
    )

    transactionResult.rows.forEach(transaction => {
        const transactionDate = new Date(transaction.date_time)

        if(transactionDate >= startOfDay){
            data.revenue.daily += Number(transaction.amount || 0)
            data.uses.daily += 1
        }

        if(transactionDate >= startOfWeek){
            data.revenue.weekly += Number(transaction.amount || 0)
            data.uses.weekly += 1
        }
        
        if(transactionDate >= startOfMonth){
            data.revenue.monthly += Number(transaction.amount || 0)
            data.uses.monthly += 1
        }

        data.revenue.total += Number(transaction.amount || 0)
        data.uses.total += 1
        data.total_hours += ((Number(transaction.amount || 0) * 10) / 60)

        data.transactions.push({
            ...transaction,
            amount: Number(transaction.amount || 0)
        })
    })

    // Get alerts for this device
    const alertResult = await pool.query(
        'SELECT * FROM tbl_alerts WHERE device_id = $1 ORDER BY date_time DESC',
        [deviceId]
    )

    alertResult.rows.forEach(alert => {
        data.alerts.push(alert)
    })

    // Get energy history for this device
    const energyHistResult = await pool.query(
        'SELECT * FROM tbl_energyhistory WHERE device_id = $1 ORDER BY date_time DESC',
        [deviceId]
    )

    // Convert numeric fields to numbers in energy history
    data.energy_history = energyHistResult.rows.map(record => ({
        ...record,
        energy_accumulated: Number(record.energy_accumulated || 0),
        voltage: Number(record.voltage || 0),
        current: Number(record.current || 0),
        temperature: Number(record.temperature || 0)
    }))

    return data
}  

module.exports = getDeviceDetails