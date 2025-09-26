const { addDoc, collection, serverTimestamp } = require("firebase/firestore")
const db = require("./connectToFirebase")

const insertAlert = async (cont, id, thrt) => {
    await addDoc(collection(db, "alerts"), {
        content: cont,
        device_id: id,
        threat: thrt,
        date_time: serverTimestamp()
    })
    
    console.log("Alert Sent")
}

module.exports = insertAlert