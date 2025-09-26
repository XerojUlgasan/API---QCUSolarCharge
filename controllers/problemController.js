const { serverTimestamp, getDocs, collection, addDoc, Transaction } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")
const { report } = require("../routes/rateRoutes")

const getStationLocations = require("../utils/getStationLocation")

exports.getProblems = async (req, res) => {
    console.log("Attempting a GET request for /reports")

    try {
        const reportSnap = await getDocs(collection(db, "reports"))

        const data = {
            reports: [],
            stations: await getStationLocations()
        }

        reportSnap.docs.forEach(doc => {
            const metadata = doc.data()
            data.reports.push({
                transaction_id: doc.id,
                ...metadata
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
    return
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
        status: "For Review", //Investigating, Resolved
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