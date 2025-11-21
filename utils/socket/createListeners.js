const {admin_db} = require("./connectToFirebaseAdmin")

const collections = [
    "devices",
    "contactUs",
    "deviceConfig",
    "energyHistory",
    "reports",
    "ratings",
    "transactions"
]

const initializeListeners = (io) => {
    collections.forEach(coll => {
        createListener(coll, io)
    })
}

const createListener = (colName, io) => {
    console.log("Listening to : " + colName)

    let isFirstSnapshot = true;

    admin_db.collection(colName).onSnapshot(snapshot => {

        if (isFirstSnapshot) {
            isFirstSnapshot = false
            // console.log("Initial snapshot received, now listening for changes...")
            return
        }

        snapshot.docChanges().forEach(change => {
            const type = change.type
            const id = change.doc.id
            const data = change.doc.data()
            
            console.log(type + " : " + colName)

            io.emit("change", {
                collectionName: colName,
                type : type,
                id: id,
                data: data
            })
        });
    })
}

const deviceConfListener = (io) => {

    const activeListeners = new Map()

    const deviceNamespace = io.of("/device-config")
    deviceNamespace.on('connection', (socket) => {
        console.log("Device Connected : " + socket.id)
        const device_id = socket.handshake.query.device_id

        console.log("LISTENING TO CONFIG : " + device_id)

        const existingUnsub = activeListeners.get(socket.id)
        if (existingUnsub) {
            existingUnsub()
            console.log("Unsubscribed from previous device")
        }

        let firstRead = true;
        const unsubscribe = admin_db.collection("deviceConfig").doc(device_id)
        .onSnapshot(snapshot => {
            
            if(firstRead){
                firstRead = false
                return
            }

            if(snapshot.exists) {
                console.log("ID : " + snapshot.id)
                console.log("Data : " + snapshot.data())
                socket.emit("device-config-update", snapshot.data())
            }
        })

        activeListeners.set(socket.id, unsubscribe)

        // socket.on("initialize-device-listener", (device_id) => {
        //     console.log("LISTENING TO CONFIG : " + device_id)

        //     const existingUnsub = activeListeners.get(socket.id)
        //     if (existingUnsub) {
        //         existingUnsub()
        //         console.log("Unsubscribed from previous device")
        //     }

        //     const unsubscribe = admin_db.collection("deviceConfig").doc(device_id)
        //     .onSnapshot(snapshot => {
        //         if(snapshot.exists) {
        //             console.log("ID : " + snapshot.id)
        //             console.log("Data : " + snapshot.data())
        //             socket.emit("device-config-update", snapshot.data())
        //         }
        //     })

        //     activeListeners.set(socket.id, unsubscribe)
        // })

        socket.on("disconnect", () => {
            console.log("Disconnected : " + socket.id)


            const unsub = activeListeners.get(socket.id) // CLEANIGN UP LISTENERS
            unsub()
            activeListeners.delete(socket.id)
            console.log("Cleaned up listener for socket: " + socket.id)
        })
    })
}

module.exports = {initializeListeners, deviceConfListener}