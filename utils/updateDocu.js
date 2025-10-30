const { setDoc, doc, serverTimestamp } = require("firebase/firestore")
const db = require("./connectToFirebase")


const updateDocu = async (path, docuId, data) => {
    await setDoc(doc(db, path, docuId), {
        ...data,
        last_updated: serverTimestamp()
    }, {merge: true})

    return
}

module.exports = updateDocu

//muchitinasub