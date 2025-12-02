const pool = require("./supabase/supabasedb")
const getDayRange = require("../utils/getFirstAndLastHourOfTheDay")
const getWeekRange = require("../utils/getFirstAndLastHourOfTheWeek")
const getMonthRange = require("../utils/getFirstAndLastHourOfTheMonth") 
const {getStateOfCharge} = require("../utils/getBatteryPercentage")

const {startOfDay, endOfDay} = getDayRange()
const {startOfWeek, endOfWeek} = getWeekRange()
const {startOfMonth, endOfMonth} = getMonthRange()   

const getAdminDashboard = async () => {
    const data = {
        energy_generated: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            total: 0
        },
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
        transactions: [],
        devices: [],
        energy_history: [],
        active_devices: 0,
        total_devices: 0,
        power_output: 0,
    }

    // Get energy history
    const energyHistoryResult = await pool.query(
        'SELECT * FROM tbl_energyhistory ORDER BY date_time DESC'
    )

    energyHistoryResult.rows.forEach(record => {
        const recordDate = new Date(record.date_time)

        if(recordDate >= startOfDay){
            data.energy_generated.daily += Number(record.energy_accumulated || 0)
        }
        if(recordDate >= startOfWeek){
            data.energy_generated.weekly += Number(record.energy_accumulated || 0)
        }
        if(recordDate >= startOfMonth){
            data.energy_generated.monthly += Number(record.energy_accumulated || 0)
        }
        data.energy_generated.total += Number(record.energy_accumulated || 0)
        
        data.energy_history.push(record)
    })

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

    devicesResult.rows.forEach(device => {
        const deviceData = {
            percentage: getStateOfCharge(device.battVolt ?? 0),
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
            last_updated: device.last_updated
        }

        data.total_devices += 1
        data.active_devices += (device.power !== null && Number(device.power) > 0) ? 1 : 0
        data.power_output += Number(device.power || 0)
        data.devices.push(deviceData)
    })

    // Get transactions
    const transactionResult = await pool.query(
        'SELECT * FROM tbl_sessions ORDER BY date_time DESC'
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

        data.transactions.push(transaction)
    })

    return data
}

module.exports = getAdminDashboard