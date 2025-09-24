const { addDoc, serverTimestamp, collection } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

exports.postEnergy = async (req, res) => {
    const { deviceId, energy,  } = req.body

    // Validate input
    if (!deviceId || !energy) {
        return res.json({ message: "Missing required fields" })
    }

    try {
        await addDoc(collection(db, "energyHistory"), {
            device_id: deviceId,
            energy_accumulated: energy,
            date_time: serverTimestamp()
        })
        
        return res.json({ message: "Energy data inserted successfully" })
    } catch (e) {
        console.error("Error inserting energy data:", e)
        return res.json({ message: e.message })
    }

}