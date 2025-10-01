const { getDocs, collection } = require("firebase/firestore")
const db = require("./connectToFirebase")

const getFirstDocId = async (collectionName) => {
    const id = (await getDocs(collection(db, collectionName))).docs[0].id
    
    return id
}

module.exports = getFirstDocId