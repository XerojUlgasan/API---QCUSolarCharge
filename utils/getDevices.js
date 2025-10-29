const { query, collection, where, getDocs } = require("firebase/firestore")
const db = require("./connectToFirebase")

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
        energy: { // standby
            daily: 0,
            weekly: 0,
            monthly: 0,
            total: 0
        },
        transactions: [],
        maintenance: [], //standby
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

    const deviceQuery = query(collection(db, "devices")) //  get by doc.id (QCU-001)
    const transactionQuery = query(collection(db, "transactions"),
                                    where("device_id", "==", deviceId))
    const alertQuery = query(collection(db, "alerts"), where("device_id", "==", deviceId))
    // const maintenanceQuery =

    const deviceSnap = await getDocs(deviceQuery)
    const transactionSnap = await getDocs(transactionQuery)
    const alertSnap = await getDocs(alertQuery)
    const energyHist = require("../utils/getDevicEnergyHistory")
    // const maintenanceSnap

    deviceSnap.docs.forEach((doc) => {
        if(doc.id === deviceId){
            const metadata = doc.data()

            data.device_id = doc.id
            data.volt = metadata.volt
            data.current = metadata.current
            data.power = metadata.power
            data.temperature = metadata.temperature
            data.percentage = getStateOfCharge(metadata.battVolt)
        }
    })

    transactionSnap.docs.forEach((doc) => {
        const metadata = doc.data()

        const transactionDate = metadata.date_time.toDate()

        if(transactionDate >= startOfDay){
                data.revenue.daily += metadata.amount
                data.uses.daily += 1
            }

        if(transactionDate >= startOfWeek){
                data.revenue.weekly += metadata.amount
                data.uses.weekly += 1
            }
        
        if(transactionDate >= startOfMonth){
                data.revenue.monthly += metadata.amount
                data.uses.monthly += 1
        }

        data.revenue.total += metadata.amount
        data.uses.total += 1
        data.total_hours += ((metadata.amount * 10) / 60)

        data.transactions.push(metadata)
    })

    alertSnap.docs.forEach(doc => {
        const metadata = doc.data()
        
        data.alerts.push(metadata)
    })

    data.energy_history.push(await energyHist(deviceId))

    return data
}  

module.exports = getDeviceDetails