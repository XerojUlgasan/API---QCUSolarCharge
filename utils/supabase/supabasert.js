const {createClient} = require("@supabase/supabase-js")

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const tables = ["tbl_admin",
                "tbl_contacts",
                "tbl_deviceconfig",
                "tbl_devices",
                "tbl_devicesdata",
                "tbl_energyhistory",
                "tbl_ratings",
                "tbl_reports",
                "tbl_sessions",
                "tbl_users"]

const initListener = () => {
    tables.forEach(table => {
        const channel = supabase
            .channel(`realtime:${table}`)
            .on(
                'postgres_changes',
                {
                    event: '*',            // can be INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: table,
                },
                (payload) => {
                    console.log(payload)
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') { 
                    console.log(`Listening to ${table}`)
                } else if (status === 'CHANNEL_ERROR') {
                    console.error(`Error subscribing to ${table}`)
                }
            })
        
        
    })
}   

module.exports = {supabase, initListener}