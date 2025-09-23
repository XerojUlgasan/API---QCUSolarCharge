const { getDocs, collection, Timestamp } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

const getDayRange = require("../utils/getFirstAndLastHourOfTheDay")
const getWeekRange = require("../utils/getFirstAndLastHourOfTheWeek")
const getMonthRange = require("../utils/getFirstAndLastHourOfTheMonth") 

exports.getDashboard = async (req, res) => {
    const devicesCol = "devices"
    const transactionsCol = "transactions"
    const {startOfDay, endOfDay} = getDayRange()
    const {startOfWeek, endOfWeek} = getWeekRange()
    const {startOfMonth, endOfMonth} = getMonthRange()   

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
        devices: [
            // {
            //     (SAMPLE DATA)
            //     current: 0,
            //     energy: 0,
            //     power: 0,
            //     volt: 0,
            //     temperature: 0,
            //     percentage: 0,
            //     status: "", // active, inactive, maintenance
            //     last_updated: 0,
            //     location: "",
            //     name: ""
            // }
        ],
        active_devices: 0,
        total_devices: 0,
        power_output: 0,
    }

    const devicesSnaphot = await getDocs(collection(db, devicesCol))
    const transactionSnapshot = await getDocs(collection(db, transactionsCol))

    devicesSnaphot.docs.forEach(docs => { // DEVICES
        const metadata = docs.data()

        data.energy_generated.total += metadata.energy
        data.total_devices += 1
        data.active_devices += (metadata.status === "active") ? 1 : 0
        data.power_output += metadata.power
        data.devices.push(metadata)

        //INSERT ENERGY GENERATED
    })

    transactionSnapshot.docs.forEach(doc => { //TRANSACTIONS
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

        data.transactions.push(metadata)

        console.log("Transaction Date" + transactionDate)
    })
    
    console.log(startOfDay)
    console.log(startOfWeek)
    console.log(startOfMonth)

    res.json(data)
    return
} 