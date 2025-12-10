const pool = require("../utils/supabase/supabasedb")
const getStationLocation = require("../utils/getStationLocation")

exports.getRates = async (req, res) => {
    console.log("Attempting a GET request for /rates")

    try {
        const { rows: ratings } = await pool.query('SELECT * FROM tbl_ratings')
        
        let previousRate = null
        if (req.query.email) {
            const { rows } = await pool.query(
                'SELECT rate, comment FROM tbl_ratings WHERE email = $1 ORDER BY "dateTime" DESC LIMIT 1',
                [req.query.email]
            )
            previousRate = rows[0] || null
        }

        res.json({
            ratings: ratings,
            previous_rate: previousRate,
            station_locations: await getStationLocation()
        })
    } catch (e) {
        res.status(500).json({ success: false, message: e.message })
    }
}

exports.setRates = async (req, res) => {
    console.log("POST /rates/postrates")
    
    const { email, name, location, building, rate, comment, photo_url, user_id } = req.body

    try {
        // Check if email already rated
        const { rows: existing } = await pool.query(
            'SELECT rating_id FROM tbl_ratings WHERE email = $1',
            [email]
        )

        if (existing.length > 0) {
            return res.json({
                success: false,
                message: "You have already submitted a rating.",
                metadata: existing[0]
            })
        }

        // Insert new rating
        await pool.query(
            `INSERT INTO tbl_ratings (rating_id, user_id, "dateTime", email, name, building, location, rate, comment, photo) 
             VALUES (gen_random_uuid()::text, $1, NOW(), $2, $3, $4, $5, $6, $7, $8)`,
            [user_id, email, name, building || "", location, rate, comment || "", photo_url || ""]
        )

        res.json({ success: true })
    } catch (e) {
        res.status(500).json({ success: false, message: e.message })
    }
}

exports.editRates = async (req, res) => {
    const { rate_id, rate = 5, comment = "", location, building } = req.body

    if (!rate_id || !location || !building) {
        return res.json({
            success: false,
            message: "Fields rate_id, location, and building are required."
        })
    }

    try {
        await pool.query(
            `UPDATE tbl_ratings 
             SET rate = $1, comment = $2, location = $3, building = $4 
             WHERE rating_id = $5`,
            [rate, comment, location, building, rate_id]
        )

        res.json({ success: true })
    } catch (e) {
        res.status(500).json({ success: false, message: e.message })
    }
}