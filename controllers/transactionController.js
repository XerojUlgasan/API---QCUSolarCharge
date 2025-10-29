const { getDocs, collection, query, where, serverTimestamp, addDoc } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

exports.getTransactions = async (req, res) => { // RETURN ALL TRANSACTIONS OR RETURN TRANSACTION TO A SPECIFIC DEVICE
    
    console.log("Attempting a GET request for /transactions")
    
    if(req.query.device_id){ //RETRIEVE SPECIFIC DEVICES ONLY
        const q = query(collection(db, "transactions"),
                        where("device_id", "==", req.query.device_id))

        const snapshot = await getDocs(q)

        if(!snapshot.empty){
            const arr = snapshot.docs.map((doc) => ({
                transaction_id: doc.id,
                ...doc.data()
            }))

            res.json(arr)
        }else {
            res.json([])
        }

    }else {
        //RETRIEVE ALL TRANSACTIONS
        const snapshot = await getDocs(collection(db, "transactions"))

        if(!snapshot.empty){
            const arr = snapshot.docs.map((doc) => ({
                transaction_id: doc.id,
                ...doc.data()
            }))

            res.json(arr)
        }else {
            res.json([])
        }
    }
}

exports.setTransaction = async (req, res) => {

    console.log("Attempting a POST request for /transactions")
    
    const data = {
        amount: req.body.amount,
        device_id: req.body.device_id,
        date_time: serverTimestamp()
    }

    try {
        const docRef = await addDoc(collection(db, "transactions"), data);
        
        res.json({
            success: true
        })
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        })
    }
}