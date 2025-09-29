const { getDocs, query, collection, where } = require("firebase/firestore")
const db = require("./connectToFirebase")

const getCol = async (colName, field, value) => {
    const q = query(collection(db, colName), where(field, "==", value))
    const snap = await getDocs(q)

    return snap.docs
}

module.exports = getCol