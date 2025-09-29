const { addDoc, collection, serverTimestamp, setDoc, doc } = require("firebase/firestore")
const db = require("./connectToFirebase")

const insertAlert = async (cont, id, thrt, type) => {

    if(!type){
        await addDoc(collection(db, "alerts"), {
            content: cont,
            device_id: id,
            threat: thrt,
            date_time: serverTimestamp()
        })
    }else {
        await addDoc(collection(db, "alerts"), {
            content: cont,
            device_id: id,
            threat: thrt,
            date_time: serverTimestamp()
        })

        await setDoc(doc(db, "alertHistory", id), {[type]: serverTimestamp()}, {merge: true}) //update alert history
    }

    console.log("Alert Sent")
}

module.exports = insertAlert