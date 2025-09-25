const { addDoc, collection, getDocs } = require("firebase/firestore");
const db = require("../utils/connectToFirebase")

exports.getContactUs = async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, "contactUs"));
        const data = [
            // {
            //     id,
            //     from,
            //     message,
            //     subject,
            //     timestamp
            //     photo_url
            // }
        ];
        snapshot.docs.forEach(doc => {
            data.push({
                id: doc.id, 
                ...doc.data() 
            });
        })

        res.json(data)

    } catch (e) {
        console.error("Error fetching documents:", e);
        res.json({ message: "Internal server error." });
    }

    return
}

exports.postContactUs = async (req, res) => {
    const { from, 
            subject, 
            message,
            photo_url } = req.body;

    if (!from || !subject || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        await addDoc(collection(db, "contactUs"), {
            from: from,
            subject: subject,
            message: message,
            timestamp: new Date(),
            photo_url: photo_url || null
        })   

        res.json({ message: "Message received. We'll get back to you shortly." });
    } catch (e) {
        console.error("Error adding document:", e);
        res.json({ message: "Internal server error." });
    }

    return
}
