const { getDocs, collection, query, where} = require("firebase/firestore")
const jwt = require("jsonwebtoken")
const db = require("../utils/connectToFirebase")


exports.login = async (req, res) => {
    console.log("Attempting a POST request for /login")

    //NOTE: ADD PROPER QUERY WHERE IT ONLY RETURN THE MATCHED SHIT

    try {
        const q = query(collection(db, "superAdmin"),
                            where("username", "==", req.body.username),
                            where("password", "==", req.body.password))

        const superAdmin = await getDocs(q)

        if(!superAdmin.empty){  // SUCCESS

            const data = superAdmin.docs[0].data()

            // INSERT JWT TOKEN
            const token = jwt.sign({username: req.body.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "7d"})

            // MUST RETURN "authorization: bearer <token>" when requesting

            res.json({
                success: true,
                token
            })
        }else {
            res.json({
                success: false,
                message: "Invalid Credentials"
            })
        }
    } catch (e) {
        res.json({
            success: false,
            note: "Error catched",
            message: e.message
        })
    }
}

