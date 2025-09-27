const { setDoc, doc, serverTimestamp } = require("firebase/firestore")
const db = require("./connectToFirebase")
const { merge } = require("../routes/rateRoutes")

const updateDocu = async (path, docuId, data) => {
    await setDoc(doc(db, path, docuId), {
        ...data,
        date_time: serverTimestamp()
    }, {merge: true})

    return
}

module.exports = updateDocu