const { getDocs, collection } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

let station_locations = []

async function getStationLocation(){
    const deviceSnap = await getDocs(collection(db, "devices"))
    deviceSnap.forEach(doc => {
        const metadata = doc.data()
        station_locations.push({
            location: metadata.location,
            building: metadata.building,
            device_id: doc.id
        })
    })
    return station_locations
}

module.exports = getStationLocation