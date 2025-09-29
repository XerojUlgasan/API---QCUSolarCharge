const { getDoc, doc } = require("firebase/firestore")
const db = require("./connectToFirebase")

const {getStateOfCharge} = require("./getBatteryPercentage")
const insertAlert = require("./inserAlert")

const checkAlert = async () => {
    console.log("Checking possible alerts\n")
    const devices = await getDeviceData()

    devices.forEach(async (device) => {
        const data = device.device_data
        const config = device.device_config
        const history = device.notif_history 
        const curr = new Date().getTime()
        const requiredGap = 3600000 //1 hour gap

        if(!config.device_alert_enabled || !config.device_enabled){
            console.log(data.device_id + ": Device alert or the device it self is not enabled\n")
            return
        }

        if(data.percentage >= config.max_batt){ 
            if(((curr - history.max_batt) >= requiredGap)){

                await insertAlert(
                    "Battery percentage is at " + data.percentage,
                    data.device_id,
                    0,
                    max_batt
                )
                console.log(data.device_id + ": Has arrived at max battery percentage")
            }
        }

        if(data.percentage <= config.min_batt){ 
            if(((curr - history.min_batt) >= requiredGap)){

                await insertAlert(
                    "Battery percentage is at " + data.percentage,
                    data.device_id,
                    3,
                    "min_batt"
                )
                console.log(data.device_id + ": Has arrived at min battery percentage")
            }
        }

        if(data.temperature >= config.max_temp){ 
            if(((curr - history.max_temp) >= requiredGap)){

                await insertAlert(
                    "Device temperature is at " + data.temperature,
                    data.device_id,
                    4,
                    "max_temp"
                )
                console.log(data.device_id + ": Has arrived at max device temperature")
            }
        }

        if(data.temperature <= config.min_temp){ 
            if(((curr - history.min_temp) >= requiredGap)){

                await insertAlert(
                    "Device temperature is at " + data.temperature,
                    data.device_id,
                    1,
                    "min_batt"
                )
                console.log(data.device_id + ": Has arrived at min device percentage")
            }
        }
    })


}

module.exports = checkAlert

    // const devices = [
    //     // {
    //     //     device_data: {
    //     //         device_id,
    //     //         temperature,
    //     //         percentage
    //     //     },
    //     //     device_config: {
    //     //         max_batt,
    //     //         min_matt,
    //     //         max_temp,
    //     //         min_temp,
    //     //         device_alert_enabled,
    //     //         device_enabled
    //     //     }
    //     // },
    // ]

const getDeviceData = async () => {
    const deviceIds = await require("./getIds")("devices")

    const devices = await Promise.all(
        deviceIds.map(async (id) => {
            const deviceDoc = (await getDoc(doc(db, "devices", id))).data()
            const configDoc = (await getDoc(doc(db, "deviceConfig", id))).data()
            const notifHistory = (await getDoc(doc(db, "alertHistory", id))).data()

            return {
                device_data: constructData(deviceDoc),
                device_config: constructConfig(configDoc),
                notif_history: constructHistory(notifHistory)
            }
        })
    )

    return devices
}

const constructData = (data) => {

    const constructedData = {
        device_id: data.device_id,
        temperature: data.temperature,
        percentage: getStateOfCharge(data.volt)
    }

    return constructedData
}

const constructConfig = (data) => {

    if(!data){
        return {
            max_batt: 100,
            min_batt: 50,
            max_temp: 40,
            min_temp: 20,
            device_alert_enabled: true,
            device_enabled: true
        }
    }
    
    const constructedData = {
        max_batt: data.max_batt,
        min_batt: data.min_batt,
        max_temp: data.max_temp,
        min_temp: data.min_temp,
        device_alert_enabled: data.device_alert_enabled,
        device_enabled: data.device_enabled
    }

    return constructedData
}

const constructHistory = (data) => {
    if(!data) {
        return {
            max_batt: 0,
            min_batt: 0,
            max_temp: 0,
            min_temp: 0
        }
    }
    
    const constructedData = {
        max_batt: data.max_batt ? data.max_batt.toDate().getTime() : 0,
        min_batt: data.min_batt ? data.min_batt.toDate().getTime() : 0,
        max_temp: data.max_temp ? data.max_temp.toDate().getTime() : 0,
        min_temp: data.min_temp ? data.min_temp.toDate().getTime() : 0
    }

    return constructedData
}