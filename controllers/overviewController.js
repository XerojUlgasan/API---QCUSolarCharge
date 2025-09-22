const { getDocs, collection, query, where, Timestamp } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")
const getDayRange = require("../utils/getFirstAndLastHourOfTheDay")

exports.getOverview = async (req, res) => {
    console.log("Attempting a GET for /overview")

    try {
        const overviewData = {
            active: 0,
            total_power: 0,
            transactions_today: 0,
            devices: []
        }

        // Devices
        const deviceSnap = await getDocs(collection(db, "devices"))
        if (!deviceSnap.empty) {
            deviceSnap.docs.forEach(d => {
                const data = d.data()
                if (data.status === "active") overviewData.active += 1
                overviewData.total_power += Number(data.power || 0)
                overviewData.devices.push({
                    id: d.id,
                    ...data
                })
            })
        }

        // Transactions today
        const { startOfDay, endOfDay } = getDayRange()
        const transactionQuery = query(
            collection(db, "transactions"),
            where("date_time", ">=", Timestamp.fromDate(startOfDay)),
            where("date_time", "<=", Timestamp.fromDate(endOfDay))
        )
        const txSnap = await getDocs(transactionQuery)
        if (!txSnap.empty) {
            overviewData.transactions_today = txSnap.docs.length
        }

        return res.json({ success: true, overview: overviewData })
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message })
    }
}