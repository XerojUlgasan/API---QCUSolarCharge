const { query, collection, where, getDocs } = require("firebase/firestore")
const db = require("./connectToFirebase")

const getId = async (collecName, fieldName, value) => {

    if(value === undefined && fieldName === undefined) {
        const ids = await getDocs(collection(db, collecName))

        return ids.docs.map(doc => doc.id)
    }

    const q = query(collection(db, collecName), where(fieldName, "==", value))
    const snap = await getDocs(q)

    const ids = snap.docs.map((doc) => doc.id)

    return ids
}

module.exports = getId