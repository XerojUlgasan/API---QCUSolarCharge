const { addDoc, serverTimestamp, collection, query, getDocs, where, setDoc, doc, getDoc } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")
const { version } = require("env")

exports.postEnergy = async (req, res) => {
    const { deviceId, energy, voltage, current, temperature} = req.body

    // Validate input
    if (deviceId == undefined || energy == undefined || voltage == undefined || current == undefined || temperature == undefined) {
        return res.status(400).json({ message: "Missing required fields" })
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

exports.giveUpdates = async (req, res) => {
    const {voltage, current, energy, power, temperature, device_id, battVolt} = req.body

    if(voltage == undefined || current == undefined || energy == undefined || power == undefined || temperature == undefined || device_id == undefined || battVolt == undefined){
        return res.status(400).json({message: "Missing required fields"})
    }

    const data = {
        volt: voltage,
        current: current,
        energy: energy,
        power: power,
        temperature: temperature,
        battVolt: battVolt
    }

    await require("../utils/updateDocu")("devices", device_id, data)

    return res.status(200).json({success: true})
}

exports.checkExist = async (req, res) => {
    const {device_id} = req.query
    
    if(device_id == undefined) {
        return res.status(400)
    }

    try {
        const result = await getDoc(doc(db, "devices", device_id))
        return res.status(200).json({doExist: result.exists()})   
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}