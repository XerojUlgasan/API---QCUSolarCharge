const { getDocs, collection, query, where, or, and} = require("firebase/firestore")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
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
        // Query without password comparison - we'll verify password with bcrypt
        const q = query(collection(db, "superAdmin"),
                            or(
                                where("username", "==", req.body.username.toLowerCase()),
                                where("email", "==", req.body.username.toLowerCase())
                            ))

        const superAdmin = await getDocs(q)

        if(!superAdmin.empty){  // User found
            const data = superAdmin.docs[0].data()
            const userId = superAdmin.docs[0].id

            // Verify password using bcrypt
            const isPasswordValid = await bcrypt.compare(req.body.password, data.password)

            if(isPasswordValid){
                // Give Token
                const token = jwt.sign({
                    userId: userId,
                    username: data.username
                }, process.env.JWT_SECRET_TOKEN, {expiresIn: "1d"})

                // MUST RETURN "authorization: bearer <token>" when requesting
                res.status(200).json({
                    success: true,
                    token
                })
            }else{
                res.status(401).json({
                    success: false,
                    message: "Invalid Credentials"
                })
            }
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

