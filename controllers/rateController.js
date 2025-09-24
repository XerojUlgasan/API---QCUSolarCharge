const { addDoc, collection, serverTimestamp, getDocs, where, query, setDoc, doc } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")
const getStationLocation = require("../utils/getStationLocation")

exports.getRates = async (req, res) => {
    console.log("Attempting a GET request for /rates")

    const colRef = collection(db, "ratings")
    const snap = await getDocs(colRef)

    let hasRated = {}

    if(req.query.email){
        const q = query(collection(db, "ratings"),
                        where("email", "==", req.query.email))
        const hasRatedSnap = await getDocs(q)

        hasRatedSnap.docs.forEach(doc => {
            const metadata = doc.data()
            
            hasRated = {
                ...metadata,
                rate_id: doc.id
            }
        })
    }

    if(!snap.empty) {
        
        const ratingSet = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        res.json({
            ratings: ratingSet,
            previous_rate: hasRated,
            station_locations: await getStationLocation()
        })
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

exports.editRates = async (req, res) => {
    const rateId = req.body.rate_id
    const rate = req.body.rate || 5
    const comment = req.body.comment || ""
    const location = req.body.location
    const building = req.body.building

    if(!rateId || !rate || !location || !building){
        res.json({
            success: false,
            message: "Fields rate_id, rate, location, and building are required."
        })

        return
    }

    try {
        await setDoc(doc(db, "ratings", rateId), {
            rate: rate,
            comment: comment,
            location: location,
            building: building
        }, {merge: true})

        res.json({
            success: true
        })
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        })
    }

    return
}