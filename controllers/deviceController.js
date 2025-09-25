const { addDoc, serverTimestamp, collection, query, getDocs, where, setDoc, doc } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")
const { version } = require("env")

exports.postEnergy = async (req, res) => {
    const { deviceId, energy, voltage, current, temperature} = req.body

    // Validate input
    if (!deviceId || !energy || !voltage || !current || !temperature) {
        return res.json({ message: "Missing required fields" })
    }

    try {
        await addDoc(collection(db, "energyHistory"), {
            device_id: deviceId,
            energy_accumulated: energy,
            date_time: serverTimestamp(),
            voltage: voltage,
            current: current,
            temperature: temperature
        })
        
        return res.json({ message: "Energy data inserted successfully" })
    } catch (e) {
        console.error("Error inserting energy data:", e)
        return res.json({ message: e.message })
    }

}

exports.getDeviceHistory = async (req, res) => {
    const { deviceId } = req.query

    const history = {
        transactions: [
            // {
            //     amount,
            //     date_time,
            //     device_id
            // }
        ],
        data: [
            // {
            //     current,
            //     energy_accumulated,
            //     date_time,
            //     device_id,
            //     temperature,
            //     voltage
            // }
        ]
    }

    if (!deviceId) {
        return res.json({ message: "Missing deviceId parameter" })
    }

    try {
        const transQuery = query(collection(db, "transactions"), where("device_id", "==", deviceId))
        const dataQuery = query(collection(db, "energyHistory"), where("device_id", "==", deviceId))

        const transactionSnapshot = await getDocs(transQuery)
        const dataSnapshot = await getDocs(dataQuery)

        transactionSnapshot.docs.forEach(doc => {
            history.transactions.push({ id: doc.id, ...doc.data() })
        })

        dataSnapshot.docs.forEach(doc => {
            history.data.push({ id: doc.id, ...doc.data() })
        })
        
        return res.json(history)
    } catch (e) {
        console.error("Error fetching device history:", e)
        return res.json({ message: e.message })
    }
}

exports.addDevice = async (req, res) => {
    const { device_id} = req.body

    if (!device_id) {
        return res.json({ message: "Missing device_id parameter" })
    }

    try {
        await setDoc(doc(db, "devices", device_id), {
            device_id: device_id,
            status: "active",
            date_added: serverTimestamp(),
            last_updated: serverTimestamp(),
            name: device_id,
            location: "Not set",
            building: "Not set",
            version: "1.0"
        })

        return res.json({ message: "Device added successfully" })        
    } catch (e) {
        console.error("Error adding device:", e)
        return res.json({ message: e.message })
    }
}