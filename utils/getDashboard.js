const { getDocs, collection } = require("firebase/firestore")
const db = require("./connectToFirebase")

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

    const energyHistorySnapshot = await getDocs(collection(db, "energyHistory"))
    const devicesSnaphot = await getDocs(collection(db, "devices"))
    const transactionSnapshot = await getDocs(collection(db, "transactions"))

    energyHistorySnapshot.docs.forEach(doc => { // ENERGY HISTORY
        console.log("energy history")
        const metadata = doc.data()
        const recordDate = metadata.date_time.toDate()

        if(recordDate >= startOfDay){
                data.energy_generated.daily += metadata.energy_accumulated
            }
        if(recordDate >= startOfWeek){
                data.energy_generated.weekly += metadata.energy_accumulated
            }
        if(recordDate >= startOfMonth){
                data.energy_generated.monthly += metadata.energy_accumulated
            }
        data.energy_generated.total += metadata.energy_accumulated
        
        data.energy_history.push({
            id: doc.id,
            ...metadata
        })
    })

    devicesSnaphot.docs.forEach(docs => { // DEVICES
        console.log("devices")
        const metadata = docs.data()

        const device = {
            percentage: getStateOfCharge(metadata.battVolt ?? 0),
            device_id: docs.id,
            ...metadata
        }
        console.log(docs.id)
        data.total_devices += 1
        data.active_devices += (metadata.status?.toLowerCase() === "active") ? 1 : 0
        data.power_output += metadata?.power
        data.devices.push(device)

        //INSERT ENERGY GENERATED
    })

    transactionSnapshot.docs.forEach(doc => { //TRANSACTIONS
        console.log("transaction")
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

        const transactionData = {
            transaction_id: doc.id,
            ...metadata
        }

        data.transactions.push(transactionData)
    })

    return data
}

module.exports = getAdminDashboard