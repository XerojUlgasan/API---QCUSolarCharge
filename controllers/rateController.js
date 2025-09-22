const { addDoc, collection, serverTimestamp, getDocs, where, query } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

exports.getRates = async (req, res) => {
    console.log("Attempting a GET request for /rates")

    const colRef = collection(db, "ratings")
    const snap = await getDocs(colRef)

    if(!snap.empty) {
        
        const ratingSet = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        res.json(ratingSet)
    }else{
        res.json([])            
    }
}

exports.setRates = async (req, res) => {
    console.log("Attempting a POST request for /rates")

    const collectionName = "ratings";

    const q = query(collection(db, collectionName), 
                    where("email", "==", req.body.email))

    const snap = await getDocs(q)

    if(!snap.empty){
        console.log("Email already rated.")

        const data = snap.docs.map(doc => ({
            ...doc.data()
        }))

        res.json({
            success: false,
            message: "You have already submitted a rating.",
            metadata: data
        })

        return
    }
    
    // //NOTE: Sanitize the data before sending

    console.log("Unique")

    const cleanData = {
        email: req.body.email,
        name: req.body.name,
        dateTime: serverTimestamp(),
        location: req.body.location,
        rate: req.body.rate,
        comment: req.body.comment,
        photo: req.body.photo_url || ""
    }

    try {
        const docRef = await addDoc(collection(db, collectionName), cleanData);
        
        res.json({
            success: true
        })
    } catch (e) {
        res.json({
            success: false,
            message: e
        })

        console.log(e)
    }
}