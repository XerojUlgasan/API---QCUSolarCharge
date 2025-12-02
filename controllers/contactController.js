const pool = require("../utils/supabase/supabasedb")

exports.getContactUs = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM tbl_contacts ORDER BY timestamp DESC')
        
        // Map contact_id to id for each contact
        const contactsWithId = rows.map(contact => ({
            ...contact,
            id: contact.contact_id
        }))
        
        res.json(contactsWithId)
    } catch (e) {
        console.error("Error fetching documents:", e)
        res.status(500).json({ message: "Internal server error." })
    }
}

exports.postContactUs = async (req, res) => {
    const { from, subject, message, photo_url, user_id } = req.body

    if (!from || !subject || !message || !user_id) {
        return res.status(400).json({ error: "All fields are required." })
    }

    try {
        await pool.query(
            `INSERT INTO tbl_contacts (contact_id, user_id, subject, message, "from", "hasRead", responded, photo_url, timestamp) 
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, false, false, $5, NOW())`,
            [user_id, subject, message, from, photo_url || null]
        )

        res.json({ message: "Message received. We'll get back to you shortly." })
    } catch (e) {
        console.error("Error adding document:", e)
        res.status(500).json({ message: "Internal server error." })
    }
}
