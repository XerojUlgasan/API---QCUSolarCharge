const { setDoc, doc, serverTimestamp } = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

exports.recordLogin = async (req, res) => {
    const {user_id, email, full_name} = req.body

    if (
    user_id === undefined ||
    email === undefined ||
    full_name === undefined
    ) {
        return res.status(400).json({message: "Invalid parameters"})
    }

    try {
        const data = {
            user_id: user_id,
            email: email,
            full_name: full_name,
            last_login: serverTimestamp()
        }

        await setDoc(doc(db, "users", user_id), data, {merge: true})
        return res.status(200).json({message: "Log Successful"})
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

exports.recordLogout = async (req, res) => {
    const {user_id} = req.body

    if ( user_id === undefined) {
        return res.status(400).json({message: "Invalid parameters"})
    }

    try {
        const data = {
            user_id: user_id,
            last_logout: serverTimestamp()
        }

        await setDoc(doc(db, "users", user_id), data, {merge: true})
        return res.status(200).json({message: "Log Successful"})
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}