const { serverTimestamp, getDocs, collection, addDoc } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

exports.getProblems = async (req, res) => {
    console.log("Attempting a GET request for /reports")

    const snap = await getDocs(collection(db, "reports"))

    if(!snap.empty){

        const problemSet = snap.docs.map(doc => ({
            id:doc.id,
            ...doc.data()
        }))
        
        res.json(problemSet)
    }else {
        res.json([])
    }
}

exports.setProblems = async (req, res) => {

    console.log("Attempting a POST request for /reports")

    const collectionName = "reports"

    // NOTE: PUT VALIDATION AND PROPER DATA CLEANING
    // check if blank or not

    const cleanData = {
        description: req.body.description || " ",
        email: req.body.email, //req
        location: req.body.location, //req
        type: req.body.type, //req
        urgencyLevel: req.body.urgencyLevel, // req
        status: "Scheduled", //Scheduled (default), Investigating, Resolved
        dateTime: serverTimestamp(),
        photo: req.body.photo_url
    }

    const docRef = await addDoc(collection(db, collectionName), cleanData)
    .then(() => {
        res.json({success: true})
    })
    .catch((e) => {
        res.json({success: false, message: e})
    })
}