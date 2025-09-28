const { setDoc, doc } = require("firebase/firestore")
const db = require("./connectToFirebase")

const insertConfig = async (data, devId) => {
    await setDoc(doc(db, "deviceConfig", devId), data, {merge: true})

    return
}

module.exports = insertConfig