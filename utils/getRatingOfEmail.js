const { query, collection, where, getDocs } = require("firebase/firestore")
const db = require("./connectToFirebase")

const getEmailRating = async (email) => {

    let hasRated = {}

    if(email){
        const q = query(collection(db, "ratings"),
                        where("email", "==", email))
        const hasRatedSnap = await getDocs(q)

        hasRatedSnap.docs.forEach(doc => {
            const metadata = doc.data()
            
             hasRated = {
                ...metadata,
                rate_id: doc.id
            }
        })
    }

    return hasRated
}

module.exports = getEmailRating