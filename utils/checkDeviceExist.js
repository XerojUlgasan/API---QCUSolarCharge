const { doc, getDoc } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

const checkDevice = async (device_id) => {
    const result = await getDoc(doc(db, "devices", device_id))

    return result.exists()
}

module.exports = checkDevice