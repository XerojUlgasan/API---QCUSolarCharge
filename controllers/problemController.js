const { serverTimestamp, getDocs, collection, addDoc, Transaction } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")
const { report } = require("../routes/rateRoutes")

exports.getProblems = async (req, res) => {
    console.log("Attempting a GET request for /reports")

    try {
        const reportSnap = await getDocs(collection(db, "reports"))
        const stationSnap = await getDocs(collection(db, "devices"))

        const data = {
            reports: [],
            stations: []
        }

        reportSnap.docs.forEach(doc => {
            const metadata = doc.data()
            data.reports.push({
                transaction_id: doc.id,
                ...metadata
            })
        })

        stationSnap.docs.forEach(doc => {
            const metadata = doc.data()
            data.stations.push({
                station_id: doc.id,
                station_building: metadata.building || "",
                station_location: metadata.location || ""
            })
        })

        res.json({
            success: true,
            ...data
        })        
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        })
    }

}

exports.setProblems = async (req, res) => {

    console.log("Attempting a POST request for /reports")

    const collectionName = "reports"

    // NOTE: PUT VALIDATION AND PROPER DATA CLEANING
    // check if blank or not

    const cleanData = {
        description: req.body.description || "",
        email: req.body.email, //req
        location: req.body.location, //req
        type: req.body.type, //req
        urgencyLevel: req.body.urgencyLevel, // req
        status: "Scheduled", //Scheduled (default), Investigating, Resolved
        dateTime: serverTimestamp(), 
        name: req.body.name, // req
        photo: req.body.photo_url || "" 
    }

    const docRef = await addDoc(collection(db, collectionName), cleanData)
    .then(() => {
        res.json({success: true})
    })
    .catch((e) => {
        res.json({success: false, message: e})
    })
}