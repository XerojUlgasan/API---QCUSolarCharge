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

module.exports = initializeListeners