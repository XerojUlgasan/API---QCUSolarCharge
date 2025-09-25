const { getDocs, collection } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

async function getAllDeviceIds() {
    const deviceSnapshot = await getDocs(collection(db, "devices"))

    const deviceIds = []

    deviceSnapshot.docs.forEach(doc => {
        deviceIds.push(doc.id)
    })

    return deviceIds
}

module.exports = getAllDeviceIds