const { getDocs, collection, Timestamp, query, where, setDoc, doc } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

const getDayRange = require("../utils/getFirstAndLastHourOfTheDay")
const getWeekRange = require("../utils/getFirstAndLastHourOfTheWeek")
const getMonthRange = require("../utils/getFirstAndLastHourOfTheMonth") 
const {getStateOfCharge} = require("../utils/getBatteryPercentage")

const {startOfDay, endOfDay} = getDayRange()
const {startOfWeek, endOfWeek} = getWeekRange()
const {startOfMonth, endOfMonth} = getMonthRange()   

exports.getDashboard = async (req, res) => {
    const devicesCol = "devices"
    const transactionsCol = "transactions"

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

    const energyHistorySnapshot = await getDocs(collection(db, "energyHistory"))
    const devicesSnaphot = await getDocs(collection(db, devicesCol))
    const transactionSnapshot = await getDocs(collection(db, transactionsCol))

    energyHistorySnapshot.docs.forEach(doc => { // ENERGY HISTORY
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
    })

    devicesSnaphot.docs.forEach(docs => { // DEVICES
        const metadata = docs.data()

        const device = {
            percentage: getStateOfCharge(metadata.volt),
            device_id: docs.id,
            ...metadata
        }

        data.total_devices += 1
        data.active_devices += (metadata.status === "active") ? 1 : 0
        data.power_output += metadata.power
        data.devices.push(device)

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

        const transactionData = {
            transaction_id: doc.id,
            ...metadata
        }

        data.transactions.push(transactionData)
    })

    res.json(data)
    return
} 

exports.getDevices = async (req, res) => {
    if(!req.query.device_id){
        res.json({
            message: "Insert device ID in query parameter!"
        })

        return
    }

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
        device_id: ""
    }

    const deviceId = req.query.device_id

    const deviceQuery = query(collection(db, "devices")) //  get by doc.id (QCU-001)
    const transactionQuery = query(collection(db, "transactions"),
                                    where("device_id", "==", deviceId))
    // const maintenanceQuery =

    const deviceSnap = await getDocs(deviceQuery)
    const transactionSnap = await getDocs(transactionQuery)
    // const maintenanceSnap

    deviceSnap.docs.forEach((doc) => {
        if(doc.id === deviceId){
            const metadata = doc.data()

            data.device_id = doc.id
            data.volt = metadata.volt
            data.current = metadata.current
            data.power = metadata.power
            data.temperature = metadata.temperature
            data.percentage = getStateOfCharge(metadata.volt)
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

    res.json(data)
    return
}

exports.updateReports = async (req, res) => {
    const reportId = req.body.problem_id
    const statusUpdate = req.body.status_update

    if(!reportId){
        res.json({
            message: "No problem ID included in query"
        })
        return
    }
    if(!statusUpdate){
        res.json({
            message: "No status update included in query"
        })
        return
    }

    try {
        await setDoc(doc(db, "reports", reportId), {
            status: statusUpdate
        }, {merge: true})

        res.json({
            success: true
        })   
    } catch (error) {
        res.json({
            success: false,
            message: error.metadata
        })  
    }

    return
}

exports.updateDevices = async (req, res) => {
    const devId = req.body.device_id 
    const devName = req.body.device_name
    const devLoc = req.body.device_location
    const devBuilding = req.body.device_building

    if(!devId || !devName || !devLoc || !devBuilding){
        res.json({
            message: "Requires device_id, device_name, device_location, and device_building"
        })
        return
    }

    try {
        await setDoc(doc(db, "devices", devId), {
            name: devName,
            location: devLoc,
            building: devBuilding
        }, {merge: true})   

        res.json({
            success: true
        })   
    } catch (e) {

        console.log("Update Device Error")
        res.json({
            success: false,
            message: e.message
        })  
    }

}

exports.sendResponseReport = async (req, res) => {

    const {email, 
            device_id, 
            response, 
            building, 
            location} = req.body

    if(!email || !device_id || !response || !building || !location){
        res.json({
            message: "Requires email, device_id, response, building, and location"
        })
        return
    }

    const {sendEmail} = require("../utils/emailSender")

    const subject = `Response to your report on device ${device_id}`
    const text = `Dear User,

We have received and reviewed your report regarding the device with the following details:

- Device ID: ${device_id}
- Building: ${building}
- Location: ${location}

Our response to your report:
${response}

If you continue to experience issues or have further concerns, please don’t hesitate to reply to this email or submit another report.

Thank you for helping us improve our services.

Sincerely,  
QCU EcoCharge Support Team
`;

    try {
        await sendEmail(email, subject, text)

        res.json({
            success: true,
            message: "Response sent successfully"
        })   
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        })
    }

    return
}

exports.sendResponseContact = async (req, res) => {
    const {email, response} = req.body
    const {sendEmail} = require("../utils/emailSender")

    if(!email || !response){
        res.json({
            message: "Requires email and response"
        })
        return
    }

    try {
        
        await sendEmail(email, "Response to your inquiry", response)

        res.json({
            success: true,
            message: "Response sent successfully"
        })

    } catch (e) {
        res.json({
            success: false,
            message: e.message
        })
    }

    return
}