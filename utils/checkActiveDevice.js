const getAllDeviceIds = require("./getAllDeviceId")
const db = require("./connectToFirebase")
const { getDoc, doc, setDoc } = require("firebase/firestore")

async function checkActiveDevice() {
    const deviceIds = await getAllDeviceIds()

    deviceIds.forEach(async (deviceId) => {
        const deviceRef = doc(db, "devices", deviceId)
        const deviceSnap = await getDoc(deviceRef)

        if(deviceSnap.exists()){
            const data = deviceSnap.data()

            if(data.status !== "maintenance") {
                const last_update = data.last_updated.toDate() || 0
                const current_time = new Date()

                const diffMs = current_time - last_update
                const diffMinutes = diffMs / 1000 / 60;

                const isInactive = diffMinutes > 2

                await setDoc(doc(db, "devices", deviceId), {
                    status: isInactive ? "Inactive" : "active"
                }, {merge: true})

                console.log(deviceId + " : " + (isInactive ? "Inactive" : "Active"))
            }
        }
    })
}

module.exports = checkActiveDevice