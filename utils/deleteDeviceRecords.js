const pool = require("./supabase/supabasedb")

const deleteRecords = async (devId) => {
    try {
        // Delete device - CASCADE will automatically delete related records
        // from tbl_deviceconfig, tbl_devicesdata, tbl_energyhistory, tbl_sessions, tbl_reports, tbl_alerts
        await pool.query(
            'DELETE FROM tbl_devices WHERE device_id = $1',
            [devId]
        )

        console.log(`Device ${devId} and all related records deleted successfully`)
    } catch (e) {
        console.error("Error deleting device records:", e)
        throw e
    }
}

module.exports = deleteRecords