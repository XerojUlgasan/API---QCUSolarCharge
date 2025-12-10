const pool = require("../utils/supabase/supabasedb")
const getStationLocations = require("../utils/getStationLocation")

exports.getProblems = async (req, res) => {
    console.log("Attempting a GET request for /reports")

    try {
        const { rows: reports } = await pool.query('SELECT * FROM tbl_reports ORDER BY "dateTime" DESC')

        // Map report_id to id for each report
        const reportsWithId = reports.map(report => ({
            ...report,
            id: report.report_id,
            location: report.device_id
        }))

        res.json({
            success: true,
            reports: reportsWithId,
            stations: await getStationLocations()
        })        
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

exports.setProblems = async (req, res) => {
    console.log("Attempting a POST request for /reports")

    const { description, email, type, urgencyLevel, name, photo_url, location, user_id } = req.body
    console.log(req.body)
    if (!email || !type || !urgencyLevel || !name || !location || !user_id) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        })
    }

    try {
        await pool.query(
            `INSERT INTO tbl_reports (report_id, device_id, user_id, "dateTime", name, email, description, type, status, "urgencyLevel", photo) 
             VALUES (gen_random_uuid()::text, $1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9)`,
            [location, user_id, name, email, description || "", type, "For Review", urgencyLevel, photo_url || ""]
        )

        res.json({ success: true })
    } catch (e) {
        res.status(500).json({ success: false, message: e.message })
    }
}