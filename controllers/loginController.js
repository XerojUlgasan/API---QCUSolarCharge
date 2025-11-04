const { getDocs, collection, query, where, or, and} = require("firebase/firestore")
const jwt = require("jsonwebtoken")
const db = require("../utils/connectToFirebase")


exports.login = async (req, res) => {
    console.log("Attempting a POST request for /login")

    if(!req.body.username || !req.body.password){
        return res.status(400).json({
            success: false,
            message: "Missing username or password"
        })
    }

    try {
        const q = query(collection(db, "superAdmin"),
                            and(
                                or(
                                where("username", "==", req.body.username.toLowerCase()),
                                where("email", "==", req.body.username.toLowerCase())
                                ),
                                where("password", "==", req.body.password)
                            ))

        const superAdmin = await getDocs(q)

        if(!superAdmin.empty){  // SUCCESS

            const data = superAdmin.docs[0].data()

            //Give Token
            const token = jwt.sign({username: req.body.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"})

            // MUST RETURN "authorization: bearer <token>" when requesting
            res.status(200).json({
                success: true,
                token
            })
        }else {
            res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            })
        }
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

