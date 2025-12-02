const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const pool = require("../utils/supabase/supabasedb")

exports.login = async (req, res) => {
    console.log("Attempting a POST request for /login")

    if(!req.body.username || !req.body.password){
        return res.status(400).json({
            success: false,
            message: "Missing username or password"
        })
    }

    try {
        // Query admin by username or email
        const { rows } = await pool.query(
            'SELECT * FROM tbl_admin WHERE username = $1 OR email = $1',
            [req.body.username.toLowerCase()]
        )

        if(rows.length > 0){  // User found
            const admin = rows[0]

            // Verify password using bcrypt
            const isPasswordValid = await bcrypt.compare(req.body.password, admin.password)

            if(isPasswordValid){
                // Give Token
                const token = jwt.sign({
                    userId: admin.admin_id,
                    username: admin.username
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

