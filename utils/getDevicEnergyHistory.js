const { query, getDocs, collection, where } = require("firebase/firestore")
const db = require("./connectToFirebase")

const getEnergyHistory = async (devId) => {
    const q = query(collection(db, "energyHistory"), where("device_id", "==", devId))
    const energyHist = await getDocs(q)

    const arr = []

    energyHist.docs.forEach(doc => {
        arr.push(doc.data())
    })

    return arr
}

module.exports = getEnergyHistory